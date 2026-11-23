import React, { useState, useEffect } from "react";

// Layout Components
import { Sidebar } from "../components/layout/Sidebar";
import { Topbar } from "../components/layout/Topbar";

// Modal Components
import {
  CreateProjectModal,
  CreateWorkspaceModal,
  InviteMemberModal,
  CreateBoardModal,
  CreateTaskModal,
  AITaskModal,
} from "../components/modals";

// Common UI
import { Toast } from "../components/common/Toast";

// Kanban Components
import { KanbanView, TaskPanel } from "../components/kanban";

// View Pages
import { DashboardView } from "./DashboardView";
import { WorkspacesView } from "./WorkspacesView";
import { ProjectsView } from "./ProjectsView";
import { CalendarView } from "./CalendarView";
import { TeamView } from "./TeamView";
import { ReportsView } from "./ReportsView";
import { NotificationsView } from "./NotificationsView";
import { ProfileView } from "./ProfileView";

// Auth Screens
import { LoginScreen, RegisterScreen } from "./auth";

// API Endpoints
import {
  authApi,
  projectApi,
  boardApi,
  taskApi,
  notificationApi,
} from "../api/endpoints";

// Constants & Helpers
import { EMPTY_COLUMNS, ACCENT } from "../utils/constants";

export default function FlowspaceApp({ initialAuthView }) {
  const [authView, setAuthView] = useState(() => {
    if (initialAuthView) return initialAuthView;
    return localStorage.getItem("token") ? "app" : "login";
  });

  useEffect(() => {
    if (initialAuthView) setAuthView(initialAuthView);
  }, [initialAuthView]);

  const [page, setPage] = useState("dashboard");
  const [dark, setDark] = useState(
    () => localStorage.getItem("flowspace_theme") === "dark"
  );
  const [selectedTask, setSelectedTask] = useState(null);
  const [notifs, setNotifs] = useState([]);
  const [notifsLoading, setNotifsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Current logged in user
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) return parsed;
      }
    } catch {}
    return { name: "User", email: "", role: "Product Lead" };
  });

  // Keep currentUser synced with backend /auth/me when token exists
  useEffect(() => {
    async function syncUser() {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const me = await authApi.getMe().catch(() => null);
        if (me && me.name) {
          setCurrentUser((prev) => {
            const merged = {
              ...prev,
              name: me.name,
              email: me.email || prev.email,
              bio: me.bio || prev.bio,
            };
            localStorage.setItem("user", JSON.stringify(merged));
            return merged;
          });
        }
      } catch (err) {
        console.warn("User sync note:", err);
      }
    }
    syncUser();
  }, [authView]);

  // Load Notifications from Backend
  const loadNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setNotifsLoading(true);
    try {
      const items = await notificationApi.list();
      if (Array.isArray(items)) {
        setNotifs(
          items.map((n) => ({
            id: n.id,
            type:
              n.type === "task_assigned"
                ? "assigned"
                : n.type || "comment",
            text: n.message || "Notification",
            time: n.created_at
              ? new Date(n.created_at).toLocaleString()
              : "Recently",
            read: Boolean(n.is_read),
            relatedTaskId: n.related_task_id,
          }))
        );
      }
    } catch (err) {
      console.warn("Notification load error:", err);
    } finally {
      setNotifsLoading(false);
    }
  };

  useEffect(() => {
    if (authView !== "app") return;
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [authView]);

  useEffect(() => {
    if (page === "notifications") {
      loadNotifications();
    }
  }, [page]);

  const markNotificationRead = async (notificationId) => {
    setNotifs((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    try {
      await notificationApi.markRead(notificationId);
    } catch (err) {
      console.warn("Notification mark read failed:", err);
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await notificationApi.markAllRead();
      showToast("All notifications marked as read", "info");
    } catch (err) {
      console.warn("Notification mark all read failed:", err);
    }
  };

  // Default fallback workspaces
  const DEFAULT_WORKSPACES = [
    { id: "w-1", name: "Engineering", projects: 0, members: 1, color: ACCENT },
    {
      id: "w-2",
      name: "Product & Design",
      projects: 0,
      members: 1,
      color: "#2563EB",
    },
    { id: "w-3", name: "Marketing", projects: 0, members: 1, color: "#DB2777" },
  ];

  const getProjectWorkspaceMap = () => {
    try {
      return JSON.parse(
        localStorage.getItem("flowspace_project_workspaces") || "{}"
      );
    } catch {
      return {};
    }
  };

  const setProjectWorkspaceMapping = (projectId, workspaceName) => {
    try {
      const map = getProjectWorkspaceMap();
      map[projectId] = workspaceName;
      localStorage.setItem("flowspace_project_workspaces", JSON.stringify(map));
    } catch {}
  };

  // Backend state with localStorage persistence fallbacks
  const [projectsList, setProjectsList] = useState(() => {
    try {
      const saved = localStorage.getItem("flowspace_projects");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const [activeProjectId, setActiveProjectId] = useState(() => {
    try {
      const saved = localStorage.getItem("flowspace_active_project_id");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed) return parsed;
      }
    } catch {}
    return null;
  });

  const [boards, setBoards] = useState([]);
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [columns, setColumns] = useState(EMPTY_COLUMNS);

  // Modals state
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [boardModalOpen, setBoardModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  // Workspaces state with localStorage persistence
  const [workspacesList, setWorkspacesList] = useState(() => {
    try {
      const saved = localStorage.getItem("flowspace_workspaces");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_WORKSPACES;
  });
  const [workspaceForm, setWorkspaceForm] = useState({
    name: "",
    color: ACCENT,
  });
  const [selectedWorkspaceFilter, setSelectedWorkspaceFilter] = useState(null);

  // Team state
  const [teamList, setTeamList] = useState([]);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    role: "Frontend Engineer",
  });

  // Form states
  const [projectForm, setProjectForm] = useState({ name: "", description: "" });
  const [boardForm, setBoardForm] = useState({ name: "", description: "" });
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
    status: "todo",
    assignee_id: "",
  });
  const [aiInput, setAiInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const showToast = (message, type = "success") => setToast({ message, type });

  // Sync dark theme to localStorage
  useEffect(() => {
    localStorage.setItem("flowspace_theme", dark ? "dark" : "light");
  }, [dark]);

  // Auto-sync workspacesList to localStorage
  useEffect(() => {
    if (workspacesList.length > 0) {
      try {
        localStorage.setItem(
          "flowspace_workspaces",
          JSON.stringify(workspacesList)
        );
      } catch {}
    }
  }, [workspacesList]);

  // Auto-sync projectsList to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("flowspace_projects", JSON.stringify(projectsList));
    } catch {}
  }, [projectsList]);

  // Auto-sync activeProjectId to localStorage
  useEffect(() => {
    if (activeProjectId) {
      try {
        localStorage.setItem(
          "flowspace_active_project_id",
          JSON.stringify(activeProjectId)
        );
      } catch {}
    }
  }, [activeProjectId]);

  // Auto-sync boards to localStorage
  useEffect(() => {
    if (activeProjectId && boards.length > 0) {
      try {
        localStorage.setItem(
          `flowspace_boards_${activeProjectId}`,
          JSON.stringify(boards)
        );
      } catch {}
    }
  }, [boards, activeProjectId]);

  // Auto-sync tasks/columns to localStorage
  useEffect(() => {
    if (activeBoardId && columns && columns !== EMPTY_COLUMNS) {
      try {
        localStorage.setItem(
          `flowspace_tasks_${activeBoardId}`,
          JSON.stringify(columns)
        );
      } catch {}
    }
  }, [columns, activeBoardId]);

  // Load Projects from Backend & seamlessly merge with local state
  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await projectApi.list().catch(() => null);
        const wsMap = getProjectWorkspaceMap();

        if (res && Array.isArray(res) && res.length > 0) {
          const mapped = res.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description || "",
            workspace: wsMap[p.id] || p.workspace || "General",
            members: [currentUser?.name || "User"],
            status: p.status || "In Progress",
            progress: p.progress || 0,
            due: p.due_date ? String(p.due_date).slice(0, 10) : "Upcoming",
          }));

          setProjectsList(mapped);
          setActiveProjectId((prev) =>
            prev && mapped.some((p) => p.id === prev) ? prev : mapped[0].id
          );

          // Ensure all project workspaces appear in workspacesList
          const projectWsNames = [
            ...new Set(mapped.map((p) => p.workspace).filter(Boolean)),
          ];
          setWorkspacesList((prev) => {
            const existingNames = new Set(prev.map((w) => w.name));
            const toAdd = projectWsNames
              .filter((name) => !existingNames.has(name))
              .map((name, idx) => ({
                id: `w-${Date.now()}-${idx}`,
                name,
                projects: mapped.filter((p) => p.workspace === name).length,
                members: 1,
                color: [ACCENT, "#F59E0B", "#2563EB", "#DB2777"][
                  (prev.length + idx) % 4
                ],
              }));
            return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
          });
        } else if (res === null) {
          // Backend was unreachable or wake-up delay; retain current/local projects without wiping
          console.warn(
            "Backend unavailable or wake-up delay, preserving local projects."
          );
        } else if (Array.isArray(res) && res.length === 0) {
          setProjectsList([]);
          setActiveProjectId(null);
          localStorage.removeItem("flowspace_projects");
          localStorage.removeItem("flowspace_active_project_id");
        }
      } catch (err) {
        console.warn("Project sync note:", err.message);
      }
    }
    loadProjects();
  }, [currentUser?.name]);

  // Load Boards when active project changes
  useEffect(() => {
    if (!activeProjectId) {
      setBoards([]);
      setActiveBoardId(null);
      return;
    }

    // Immediately restore cached boards if available for instant display
    try {
      const saved = JSON.parse(
        localStorage.getItem(`flowspace_boards_${activeProjectId}`) || "[]"
      );
      if (saved.length > 0) {
        setBoards(saved);
        setActiveBoardId((prev) =>
          prev && saved.some((b) => b.id === prev) ? prev : saved[0].id
        );
      }
    } catch {}

    async function loadBoards() {
      try {
        const res = await boardApi.list(activeProjectId).catch(() => null);
        if (res && Array.isArray(res) && res.length > 0) {
          setBoards(res);
          setActiveBoardId((prev) =>
            prev && res.some((b) => b.id === prev) ? prev : res[0].id
          );
        } else if (res && Array.isArray(res) && res.length === 0) {
          // If project has no board on backend, auto-create a default board so tasks can be added
          const created = await boardApi
            .create(activeProjectId, "Main Board", "Sprint board")
            .catch(() => null);
          const newB = created?.id
            ? created
            : {
                id: `b-${activeProjectId}`,
                name: "Main Board",
                description: "Sprint board",
              };
          setBoards([newB]);
          setActiveBoardId(newB.id);
        }
      } catch (err) {
        console.warn("Boards sync note:", err.message);
      }
    }
    loadBoards();
  }, [activeProjectId]);

  // Load Tasks when active board changes
  useEffect(() => {
    if (!activeBoardId) {
      setColumns(EMPTY_COLUMNS);
      return;
    }

    // Immediately restore cached tasks for instant render on refresh
    try {
      const savedTasks = localStorage.getItem(
        `flowspace_tasks_${activeBoardId}`
      );
      if (savedTasks) {
        const parsed = JSON.parse(savedTasks);
        if (parsed && typeof parsed === "object") {
          setColumns(parsed);
        }
      }
    } catch {}

    async function loadTasks() {
      try {
        const res = await taskApi.list(activeBoardId).catch(() => null);
        if (res && Array.isArray(res)) {
          if (res.length === 0) {
            setColumns(EMPTY_COLUMNS);
            localStorage.removeItem(`flowspace_tasks_${activeBoardId}`);
          } else {
            const newCols = {
              todo: { title: "To Do", tasks: [] },
              inprogress: { title: "In Progress", tasks: [] },
              inreview: { title: "In Review", tasks: [] },
              completed: { title: "Completed", tasks: [] },
            };
            res.forEach((t) => {
              const st = (t.status || "todo").replace("_", "").toLowerCase();
              const targetKey =
                st === "done" || st === "completed"
                  ? "completed"
                  : st === "inreview"
                  ? "inreview"
                  : st === "inprogress"
                  ? "inprogress"
                  : "todo";
              newCols[targetKey].tasks.push({
                id: t.id,
                title: t.title,
                desc: t.description || "",
                priority: t.priority || "medium",
                assignee: currentUser?.name || "User",
                due: t.due_date ? String(t.due_date).slice(0, 10) : "",
                progress: targetKey === "completed" ? 100 : t.progress || 0,
                labels: t.labels || (t.priority ? [t.priority] : []),
              });
            });
            setColumns(newCols);
          }
        }
      } catch (err) {
        console.warn("Tasks sync note:", err.message);
      }
    }
    loadTasks();
  }, [activeBoardId, currentUser?.name]);

  // Load Team Members when active project changes
  useEffect(() => {
    if (!activeProjectId) {
      if (currentUser?.name) {
        setTeamList([
          {
            id: "u1",
            name: currentUser.name,
            email: currentUser.email || "",
            role: currentUser.role || "Lead",
            status: "Active",
            projects: projectsList.length,
          },
        ]);
      } else {
        setTeamList([]);
      }
      return;
    }
    async function loadMembers() {
      try {
        const res = await projectApi.members(activeProjectId).catch(() => null);
        if (res && Array.isArray(res) && res.length > 0) {
          const mapped = res.map((m) => ({
            id: m.id || m.email,
            name: m.name || m.username || "Team Member",
            email: m.email || "",
            role: m.role || "Contributor",
            status: "Active",
            projects: 1,
          }));
          setTeamList(mapped);
        } else if (currentUser?.name) {
          setTeamList([
            {
              id: "u1",
              name: currentUser.name,
              email: currentUser.email || "",
              role: currentUser.role || "Lead",
              status: "Active",
              projects: projectsList.length,
            },
          ]);
        } else {
          setTeamList([]);
        }
      } catch (err) {
        console.warn("Members sync note:", err.message);
        if (currentUser?.name) {
          setTeamList([
            {
              id: "u1",
              name: currentUser.name,
              email: currentUser.email || "",
              role: currentUser.role || "Lead",
              status: "Active",
              projects: projectsList.length,
            },
          ]);
        } else {
          setTeamList([]);
        }
      }
    }
    loadMembers();
  }, [
    activeProjectId,
    currentUser?.name,
    currentUser?.email,
    currentUser?.role,
    projectsList.length,
  ]);

  // Handle Create Project
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectForm.name.trim()) return;
    setSubmitting(true);
    const chosenWorkspace = selectedWorkspaceFilter || "General";
    try {
      const created = await projectApi
        .create(projectForm.name, projectForm.description)
        .catch(() => null);
      const projectId = created?.id || Date.now();
      setProjectWorkspaceMapping(projectId, chosenWorkspace);

      const newP = {
        id: projectId,
        name: projectForm.name,
        description: projectForm.description || "",
        workspace: chosenWorkspace,
        members: [currentUser?.name || "User"],
        status: "In Progress",
        progress: 0,
        due: "Upcoming",
      };

      setProjectsList((prev) => [newP, ...prev]);
      setActiveProjectId(newP.id);

      // Auto-create default board for the newly created project
      try {
        const createdBoard = await boardApi
          .create(projectId, "Main Board", "Sprint board")
          .catch(() => null);
        const newB = createdBoard?.id
          ? createdBoard
          : {
              id: `b-${projectId}`,
              name: "Main Board",
              description: "Sprint board",
            };
        setBoards([newB]);
        setActiveBoardId(newB.id);
      } catch {}

      setProjectModalOpen(false);
      setProjectForm({ name: "", description: "" });
      showToast(`Project "${newP.name}" created!`);
    } catch {
      showToast("Error creating project", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Project
  const handleDeleteProject = async (projectId) => {
    setProjectsList((prev) => {
      const updated = prev.filter((p) => p.id !== projectId);
      return updated;
    });
    if (activeProjectId === projectId) {
      const remaining = projectsList.filter((p) => p.id !== projectId);
      if (remaining.length > 0) setActiveProjectId(remaining[0].id);
    }
    showToast("Project deleted", "info");
    try {
      await projectApi.delete(projectId).catch(() => null);
    } catch {
      // Optimistic UI retained
    }
  };

  // Handle Create Workspace
  const handleCreateWorkspace = (e) => {
    e.preventDefault();
    if (!workspaceForm.name.trim()) return;
    const newW = {
      id: `w-${Date.now()}`,
      name: workspaceForm.name.trim(),
      projects: 0,
      members: 1,
      color: workspaceForm.color || ACCENT,
    };
    setWorkspacesList((prev) => [...prev, newW]);
    setSelectedWorkspaceFilter(newW.name);
    setWorkspaceModalOpen(false);
    setWorkspaceForm({ name: "", color: ACCENT });
    showToast(`Workspace "${newW.name}" created!`);
  };

  // Handle Invite Team Member
  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) return;
    try {
      if (activeProjectId) {
        await projectApi
          .addMember(activeProjectId, inviteForm.email.trim(), inviteForm.role)
          .catch(() => null);
      }
    } catch {}
    const newMember = {
      id: `m-${Date.now()}`,
      name: inviteForm.name.trim(),
      email: inviteForm.email.trim(),
      role: inviteForm.role || "Frontend Engineer",
      tasks: 0,
      status: "Active",
      projects: 1,
    };
    setTeamList((prev) => [...prev, newMember]);
    setInviteModalOpen(false);
    setInviteForm({ name: "", email: "", role: "Frontend Engineer" });
    showToast(`Invitation sent to ${newMember.email}!`);
  };

  // Handle Delete Team Member
  const handleDeleteMember = (memberId) => {
    setTeamList((prev) =>
      prev.filter((m) => m.id !== memberId && m.email !== memberId)
    );
    showToast("Team member removed", "info");
  };

  // Handle Open New Task Modal for specific column
  const handleOpenNewTaskModal = (colKey) => {
    const validCol =
      typeof colKey === "string" &&
      ["todo", "inprogress", "inreview", "completed"].includes(colKey)
        ? colKey
        : "todo";
    setTaskForm({
      title: "",
      description: "",
      priority: "medium",
      due_date: "",
      status: validCol,
      assignee_id: "",
    });
    setTaskModalOpen(true);
  };

  // Handle Create Board
  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!boardForm.name.trim() || !activeProjectId) return;
    setSubmitting(true);
    try {
      const created = await boardApi
        .create(activeProjectId, boardForm.name, boardForm.description)
        .catch(() => null);
      const newB = {
        id: created?.id || Date.now(),
        name: boardForm.name,
        description: boardForm.description,
      };
      setBoards((prev) => [...prev, newB]);
      setActiveBoardId(newB.id);
      setBoardModalOpen(false);
      setBoardForm({ name: "", description: "" });
      showToast(`Board "${newB.name}" created!`);
    } catch {
      showToast("Error creating board", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Create Task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    setSubmitting(true);
    try {
      let created = null;
      if (activeBoardId) {
        created = await taskApi
          .create(activeBoardId, {
            title: taskForm.title,
            description: taskForm.description,
            priority: taskForm.priority,
            due_date: taskForm.due_date || null,
            assignee_id: taskForm.assignee_id || null,
          })
          .catch(() => null);
      }

      // If assignee is a different user/member, call taskApi.assign to trigger backend notification
      if (
        created?.id &&
        taskForm.assignee_id &&
        taskForm.assignee_id !== "currentUser"
      ) {
        await taskApi.assign(created.id, taskForm.assignee_id).catch((err) => {
          console.warn("Auto-assign notification dispatch note:", err);
        });
      }

      // Determine display name for the assigned user
      const assignedMember = teamList.find(
        (m) =>
          String(m.id) === String(taskForm.assignee_id) ||
          m.email === taskForm.assignee_id
      );
      const assigneeName =
        assignedMember?.name ||
        (taskForm.assignee_id && taskForm.assignee_id !== "currentUser"
          ? "Team Member"
          : currentUser?.name || "User");

      const targetColKey = taskForm.status || "todo";
      const newT = {
        id: created?.id || Date.now(),
        title: taskForm.title,
        desc: taskForm.description,
        priority: taskForm.priority,
        assignee: assigneeName,
        assignee_id: taskForm.assignee_id || null,
        due: taskForm.due_date || "",
        progress: targetColKey === "completed" ? 100 : 0,
        labels: taskForm.priority ? [taskForm.priority] : [],
      };
      setColumns((prev) => ({
        ...prev,
        [targetColKey]: {
          ...prev[targetColKey],
          tasks: [newT, ...(prev[targetColKey]?.tasks || [])],
        },
      }));
      setTaskModalOpen(false);
      setTaskForm({
        title: "",
        description: "",
        priority: "medium",
        due_date: "",
        status: "todo",
        assignee_id: "",
      });
      showToast(`Task "${newT.title}" assigned to ${assigneeName}!`);
    } catch {
      showToast("Error creating task", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Assign Task
  const handleAssignTask = async (taskId, assigneeId) => {
    if (!taskId || !assigneeId) return;
    const selectedMember = teamList.find(
      (m) => String(m.id) === String(assigneeId) || m.email === assigneeId
    );
    const newAssigneeName =
      selectedMember?.name ||
      (assigneeId === "currentUser" ? currentUser?.name : "Team Member");

    // Optimistically update columns
    setColumns((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        next[k] = {
          ...next[k],
          tasks: (next[k]?.tasks || []).map((t) =>
            t.id === taskId
              ? { ...t, assignee: newAssigneeName, assignee_id: assigneeId }
              : t
          ),
        };
      });
      return next;
    });

    // Optimistically update selectedTask detail
    setSelectedTask((prev) =>
      prev && prev.id === taskId
        ? { ...prev, assignee: newAssigneeName, assignee_id: assigneeId }
        : prev
    );

    try {
      if (assigneeId !== "currentUser") {
        await taskApi.assign(taskId, assigneeId);
      }
      showToast(`Task assigned to ${newAssigneeName}! Notification sent.`);
    } catch (err) {
      console.warn("Task assign note:", err);
      showToast(`Task assigned to ${newAssigneeName}`);
    }
  };

  // Handle Move Task Status
  const handleMoveTask = async (taskId, newStatus) => {
    let movedTask = null;
    const newCols = { ...columns };

    Object.keys(newCols).forEach((k) => {
      const idx = newCols[k].tasks.findIndex((t) => t.id === taskId);
      if (idx !== -1) {
        [movedTask] = newCols[k].tasks.splice(idx, 1);
      }
    });

    if (movedTask) {
      const targetColKey =
        newStatus === "completed" || newStatus === "done"
          ? "completed"
          : newStatus === "in_review" || newStatus === "inreview"
          ? "inreview"
          : newStatus === "in_progress" || newStatus === "inprogress"
          ? "inprogress"
          : "todo";

      movedTask.status = targetColKey;
      movedTask.progress =
        targetColKey === "completed" ? 100 : movedTask.progress;
      newCols[targetColKey].tasks.push(movedTask);
      setColumns({ ...newCols });

      if (selectedTask?.id === taskId) {
        setSelectedTask({ ...movedTask });
      }

      showToast(`Task moved to ${newCols[targetColKey].title}`);
      try {
        await taskApi.move(taskId, newStatus, 0).catch(() => null);
      } catch {
        // Optimistic UI retained
      }
    }
  };

  // Handle Delete Task
  const handleDeleteTask = async (taskId) => {
    const newCols = { ...columns };
    Object.keys(newCols).forEach((k) => {
      newCols[k].tasks = newCols[k].tasks.filter((t) => t.id !== taskId);
    });
    setColumns({ ...newCols });
    if (selectedTask?.id === taskId) setSelectedTask(null);
    showToast("Task deleted", "info");
    try {
      await taskApi.delete(taskId).catch(() => null);
    } catch {
      // Ignored
    }
  };

  // Handle TaskPanel Checklist Update
  const handleUpdateTaskChecklist = (taskId, newChecklist) => {
    const newCols = { ...columns };
    let updatedTask = null;
    Object.keys(newCols).forEach((k) => {
      newCols[k].tasks = newCols[k].tasks.map((t) => {
        if (t.id === taskId) {
          updatedTask = { ...t, checklist: newChecklist };
          return updatedTask;
        }
        return t;
      });
    });
    setColumns(newCols);
    if (selectedTask?.id === taskId && updatedTask) {
      setSelectedTask(updatedTask);
    }
  };

  // Handle TaskPanel Comment Add
  const handleAddComment = (taskId, commentText) => {
    const newComment = {
      author: currentUser?.name || "User",
      text: commentText,
      time: "Just now",
    };
    const newCols = { ...columns };
    let updatedTask = null;
    Object.keys(newCols).forEach((k) => {
      newCols[k].tasks = newCols[k].tasks.map((t) => {
        if (t.id === taskId) {
          const comments = t.comments || [];
          updatedTask = { ...t, comments: [newComment, ...comments] };
          return updatedTask;
        }
        return t;
      });
    });
    setColumns(newCols);
    if (selectedTask?.id === taskId && updatedTask) {
      setSelectedTask(updatedTask);
    }
  };

  // Handle AI Task Generation (Gemini 2.5 Flash)
  const handleAiTask = async (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    setSubmitting(true);
    try {
      let res = null;
      if (activeProjectId && activeBoardId) {
        res = await taskApi
          .createWithAI(activeProjectId, activeBoardId, aiInput)
          .catch(() => null);
      }
      const taskObj = res?.task || {
        id: Date.now(),
        title: aiInput.slice(0, 50),
        desc: `AI-synthesized task: "${aiInput}"`,
        priority:
          aiInput.toLowerCase().includes("urgent") ||
          aiInput.toLowerCase().includes("high")
            ? "high"
            : "medium",
        assignee: currentUser?.name || "User",
        due: "",
        progress: 0,
        labels: ["AI-Generated"],
      };
      setColumns((prev) => ({
        ...prev,
        todo: { ...prev.todo, tasks: [taskObj, ...prev.todo.tasks] },
      }));
      setAiModalOpen(false);
      setAiInput("");
      showToast("Task synthesized with Gemini AI!", "info");
    } catch {
      showToast("AI generation failed — added local fallback", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const unreadCount = notifs.filter((n) => !n.read).length;
  const currentProjectName =
    projectsList.find((p) => p.id === activeProjectId)?.name ||
    (projectsList.length > 0 ? projectsList[0].name : "Tasks");

  if (authView === "login")
    return (
      <LoginScreen
        goRegister={() => setAuthView("register")}
        enterApp={() => {
          setAuthView("app");
          setPage("dashboard");
          showToast("Signed in successfully!");
        }}
        onLoginSuccess={setCurrentUser}
      />
    );
  if (authView === "register")
    return (
      <RegisterScreen
        goLogin={() => setAuthView("login")}
        enterApp={() => {
          setAuthView("app");
          setPage("dashboard");
          showToast("Account created!");
        }}
        onLoginSuccess={setCurrentUser}
      />
    );

  return (
    <div
      className={`flowspace-shell ${
        dark
          ? "dark-theme dark bg-[#090D16] text-slate-100"
          : "bg-slate-50 text-slate-900"
      } min-h-screen h-screen w-full flex overflow-hidden`}
      style={{
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-full shrink-0">
        <Sidebar
          page={page}
          setPage={setPage}
          dark={dark}
          setAuthView={setAuthView}
          currentUser={currentUser}
        />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" />
          <div
            className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar
              page={page}
              setPage={setPage}
              dark={dark}
              isMobile
              onClose={() => setMobileMenuOpen(false)}
              setAuthView={setAuthView}
              currentUser={currentUser}
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          dark={dark}
          setDark={setDark}
          unreadCount={unreadCount}
          setPage={setPage}
          setAuthView={setAuthView}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          currentUser={currentUser}
          workspacesList={workspacesList}
          selectedWorkspace={selectedWorkspaceFilter}
          onSelectWorkspace={(name) => {
            setSelectedWorkspaceFilter(name);
            setPage("projects");
          }}
        />

        <main
          className={`flex-1 overflow-y-auto p-7 ${
            dark ? "bg-[#090D16]" : "bg-slate-50"
          }`}
        >
          {page === "dashboard" && (
            <DashboardView
              dark={dark}
              openTask={setSelectedTask}
              projectsList={projectsList}
              columns={columns}
              setPage={setPage}
              setActiveProjectId={setActiveProjectId}
              currentUser={currentUser}
              onOpenNewTask={handleOpenNewTaskModal}
              onOpenCreateProject={() => setProjectModalOpen(true)}
              onOpenAiModal={() => setAiModalOpen(true)}
            />
          )}
          {page === "workspaces" && (
            <WorkspacesView
              dark={dark}
              workspacesList={workspacesList}
              onOpenNewWorkspace={() => setWorkspaceModalOpen(true)}
              onSelectWorkspace={(name) => {
                setSelectedWorkspaceFilter(name);
                setPage("projects");
              }}
              projectsList={projectsList}
            />
          )}
          {page === "projects" && (
            <ProjectsView
              dark={dark}
              projectsList={projectsList}
              activeProjectId={activeProjectId}
              setActiveProjectId={setActiveProjectId}
              setPage={setPage}
              onOpenCreateProject={() => setProjectModalOpen(true)}
              onDeleteProject={handleDeleteProject}
              selectedWorkspaceFilter={selectedWorkspaceFilter}
              setSelectedWorkspaceFilter={setSelectedWorkspaceFilter}
            />
          )}
          {page === "kanban" && (
            <KanbanView
              dark={dark}
              openTask={setSelectedTask}
              columns={columns}
              onOpenNewTask={handleOpenNewTaskModal}
              onOpenNewBoard={() => setBoardModalOpen(true)}
              onOpenAiModal={() => setAiModalOpen(true)}
              boards={boards}
              activeBoardId={activeBoardId}
              setActiveBoardId={setActiveBoardId}
              onMoveTask={handleMoveTask}
              activeProjectName={currentProjectName}
            />
          )}
          {page === "calendar" && (
            <CalendarView dark={dark} columns={columns} />
          )}
          {page === "team" && (
            <TeamView
              dark={dark}
              teamList={teamList}
              onOpenInvite={() => setInviteModalOpen(true)}
              onDeleteMember={handleDeleteMember}
            />
          )}
          {page === "reports" && (
            <ReportsView
              dark={dark}
              projectsList={projectsList}
              columns={columns}
              showToast={showToast}
            />
          )}
          {page === "notifications" && (
            <NotificationsView
              dark={dark}
              notifs={notifs}
              setNotifs={setNotifs}
              onMarkRead={markNotificationRead}
              onMarkAllRead={markAllNotificationsRead}
              onRefresh={loadNotifications}
              loading={notifsLoading}
            />
          )}
          {page === "profile" && (
            <ProfileView
              dark={dark}
              setDark={setDark}
              showToast={showToast}
              currentUser={currentUser}
              onUpdateUser={setCurrentUser}
            />
          )}
        </main>
      </div>

      {selectedTask && (
        <TaskPanel
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          dark={dark}
          onMove={handleMoveTask}
          onDelete={handleDeleteTask}
          onUpdateChecklist={handleUpdateTaskChecklist}
          onAddComment={handleAddComment}
          currentUser={currentUser}
          teamList={teamList}
          onAssign={handleAssignTask}
        />
      )}

      {/* New Project Modal */}
      <CreateProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        dark={dark}
        projectForm={projectForm}
        setProjectForm={setProjectForm}
        onSubmit={handleCreateProject}
        submitting={submitting}
      />

      {/* New Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={workspaceModalOpen}
        onClose={() => setWorkspaceModalOpen(false)}
        dark={dark}
        workspaceForm={workspaceForm}
        setWorkspaceForm={setWorkspaceForm}
        onSubmit={handleCreateWorkspace}
      />

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        dark={dark}
        inviteForm={inviteForm}
        setInviteForm={setInviteForm}
        onSubmit={handleInviteMember}
      />

      {/* New Board Modal */}
      <CreateBoardModal
        isOpen={boardModalOpen}
        onClose={() => setBoardModalOpen(false)}
        dark={dark}
        boardForm={boardForm}
        setBoardForm={setBoardForm}
        onSubmit={handleCreateBoard}
        submitting={submitting}
      />

      {/* New Task Modal */}
      <CreateTaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        dark={dark}
        taskForm={taskForm}
        setTaskForm={setTaskForm}
        currentUser={currentUser}
        teamList={teamList}
        onSubmit={handleCreateTask}
        submitting={submitting}
      />

      {/* AI Task Modal (Gemini 2.5 Flash) */}
      <AITaskModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        dark={dark}
        aiInput={aiInput}
        setAiInput={setAiInput}
        onSubmit={handleAiTask}
        submitting={submitting}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
