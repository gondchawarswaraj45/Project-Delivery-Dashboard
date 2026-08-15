import React, { useState, useEffect } from "react";
import { CheckCircle2, Circle, PlayCircle, List, LayoutGrid, AlertTriangle, User, X, Calendar, Flag } from "lucide-react";
import { useProjectContext } from "../../context/ProjectContext";
import { Project, Task, TaskStatus } from "../../types";

interface MilestonesTabProps { project: Project; }

const PRIORITY_COLOR: Record<string, string> = { HIGH: "#ef4444", MEDIUM: "#f59e0b", LOW: "#6b7280" };
const STATUS_LABEL_INTERNAL: Record<string, string> = { NOT_STARTED: "Not Started", IN_PROGRESS: "In Progress", BLOCKED: "Blocked", DONE: "Done" };
const STATUS_LABEL_CUSTOMER: Record<string, string> = { NOT_STARTED: "Scheduled", IN_PROGRESS: "In Progress", BLOCKED: "Waiting on Client Access", DONE: "Completed" };

const TaskDetailPanel: React.FC<{ task: Task; viewMode: "internal" | "customer"; onClose: () => void }> = ({ task, viewMode, onClose }) => {
  const { users } = useProjectContext();
  const owner = users.find((u) => u.id === task.ownerId);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const displayTitle = viewMode === "customer" && task.customerFacingTitle ? task.customerFacingTitle : task.title;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 200, backdropFilter: "blur(2px)" }} />
      <div className="animate-fade-in" style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "380px", background: "var(--bg-card)", borderLeft: "1px solid var(--border-color)", boxShadow: "-8px 0 32px rgba(0,0,0,0.18)", zIndex: 201, display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", background: "var(--bg-primary)" }}>
          <div>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px" }}>
              {viewMode === "internal" ? "🔒 Internal Task Diagnostics" : "📋 Milestone Item Details"}
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", lineHeight: 1.3 }}>{displayTitle}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px", display: "flex", alignItems: "center" }}><X size={18} /></button>
        </div>

        {/* Status bar */}
        <div style={{ padding: "14px 24px", borderBottom: "1px solid var(--border-color)", background: task.status === "BLOCKED" ? (viewMode === "internal" ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.08)") : task.status === "DONE" ? "rgba(16,185,129,0.08)" : "var(--bg-primary)" }}>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "6px" }}>Status</div>
          <span className={`status-badge ${task.status}`} style={{ fontSize: "0.85rem", padding: "4px 14px" }}>
            {viewMode === "internal" ? STATUS_LABEL_INTERNAL[task.status] : STATUS_LABEL_CUSTOMER[task.status]}
          </span>
        </div>

        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Owner (Internal) or Implementation Lead (Customer) */}
          <div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "5px" }}>
              <User size={12} /> {viewMode === "internal" ? "Internal Owner" : "Assigned Implementation Lead"}
            </div>
            {owner ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="avatar-circle" style={{ width: "32px", height: "32px", fontSize: "0.75rem" }}>{owner.initials}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-main)" }}>{owner.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{owner.role} {viewMode === "internal" && `• ${owner.team}`}</div>
                </div>
              </div>
            ) : <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Delivery Team</div>}
          </div>

          {/* Priority (Internal only) */}
          {viewMode === "internal" && (
            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "5px" }}><Flag size={12} /> Internal Priority</div>
              <span style={{ fontSize: "0.9rem", fontWeight: 700, color: PRIORITY_COLOR[task.priority] || "var(--text-main)" }}>{task.priority}</span>
            </div>
          )}

          {/* Due Date */}
          <div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "5px" }}><Calendar size={12} /> {viewMode === "internal" ? "Target Due Date" : "Estimated Completion"}</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-main)" }}>{task.dueDate}</div>
          </div>

          {/* Blocker representation: Internal Note vs Customer safe message */}
          {task.status === "BLOCKED" && (
            <div style={{
              padding: "14px 16px",
              background: viewMode === "internal" ? "rgba(239,68,68,0.07)" : "rgba(245,158,11,0.08)",
              border: `1px solid ${viewMode === "internal" ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)"}`,
              borderRadius: "var(--radius-sm)"
            }}>
              <div style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: viewMode === "internal" ? "#ef4444" : "#d97706",
                marginBottom: "6px",
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}>
                <AlertTriangle size={13} /> {viewMode === "internal" ? "🔒 Internal Blocker Note" : "📋 Action Required from Client"}
              </div>
              <div style={{ fontSize: "0.875rem", color: "var(--text-main)", lineHeight: 1.5 }}>
                {viewMode === "internal"
                  ? (task.blocker || "Blocked by external dependency. Escalate to account manager.")
                  : (task.customerBlockerReason || "Waiting for required access information from the customer team to complete integration.")}
              </div>
            </div>
          )}

          {/* Action button */}
          {viewMode === "internal" && task.status === "BLOCKED" && owner && (
            <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }} onClick={() => alert(`Email update request sent to ${owner.email}`)}>
              📧 Escalate to {owner.name.split(" ")[0]}
            </button>
          )}

          {viewMode === "customer" && task.status === "BLOCKED" && (
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => alert("Thank you! Your implementation lead has been notified that you are ready to provide access credentials.")}>
              💬 Provide Access / Contact Lead
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export const MilestonesTab: React.FC<MilestonesTabProps> = ({ project }) => {
  const { milestones, tasks, users, updateTaskStatus, viewMode } = useProjectContext();
  const [displayMode, setDisplayMode] = useState<"list" | "kanban">("list");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const projectMilestones = milestones.filter((m) => m.projectId === project.id).sort((a, b) => a.orderIndex - b.orderIndex);
  const projectTasks = tasks.filter((t) => t.projectId === project.id);

  const renderStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "DONE":        return <CheckCircle2 size={18} color="var(--status-ontrack-color)" />;
      case "IN_PROGRESS": return <PlayCircle   size={18} color="var(--status-completed-color)" />;
      case "BLOCKED":     return <AlertTriangle size={18} color={viewMode === "internal" ? "var(--status-blocked-color)" : "var(--status-atrisk-color)"} />;
      default:            return <Circle size={18} color="var(--text-subtle)" />;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {selectedTask && <TaskDetailPanel task={selectedTask} viewMode={viewMode} onClose={() => setSelectedTask(null)} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)" }}>
            {viewMode === "internal" ? "Milestones & Operational Tasks (Internal)" : "Project Delivery Milestones & Progress (Customer)"}
          </h3>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            {viewMode === "internal"
              ? "Full operational task breakdown with internal owners, dependencies, and blocker logs"
              : "Customer-safe milestone tracking and delivery schedule"}
          </p>
        </div>

        <div className="view-toggle">
          <button className={displayMode === "list" ? "active internal" : ""} onClick={() => setDisplayMode("list")}><List size={14} /><span>List</span></button>
          <button className={displayMode === "kanban" ? "active internal" : ""} onClick={() => setDisplayMode("kanban")}><LayoutGrid size={14} /><span>Kanban</span></button>
        </div>
      </div>

      {displayMode === "list" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {projectMilestones.map((ms) => {
            const msTasks = projectTasks.filter((t) => t.milestoneId === ms.id);
            const doneCount = msTasks.filter((t) => t.status === "DONE").length;
            return (
              <div key={ms.id} className="glass-panel" style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-main)" }}>{ms.name}</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>({doneCount}/{msTasks.length} {viewMode === "internal" ? "tasks" : "items"})</span>
                  </div>
                  <span className={`status-badge ${ms.status}`}>
                    {viewMode === "internal" ? ms.status.replace("_", " ") : (ms.status === "DONE" ? "Completed" : ms.status === "IN_PROGRESS" ? "In Progress" : ms.status === "BLOCKED" ? "Needs Attention" : "Scheduled")}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingLeft: "16px", borderLeft: "2px solid var(--border-color)" }}>
                  {msTasks.map((task) => {
                    const taskOwner = users.find((u) => u.id === task.ownerId);
                    const taskTitle = viewMode === "customer" && task.customerFacingTitle ? task.customerFacingTitle : task.title;

                    return (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", cursor: "pointer", transition: "box-shadow 0.15s" }}
                        onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)")}
                        onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {renderStatusIcon(task.status)}
                          <div>
                            <div style={{ fontWeight: 500, fontSize: "0.9rem", color: "var(--text-main)" }}>{taskTitle}</div>
                            {task.status === "BLOCKED" && (
                              <div style={{
                                fontSize: "0.78rem",
                                color: viewMode === "internal" ? "#ef4444" : "#d97706",
                                marginTop: "2px",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px"
                              }}>
                                <AlertTriangle size={11} />
                                {viewMode === "internal"
                                  ? (task.blocker || "Internal Blocker: Escalation pending")
                                  : (task.customerBlockerReason || "Waiting for required access information")}
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {viewMode === "internal" ? (
                            <>
                              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: PRIORITY_COLOR[task.priority] || "#6b7280", flexShrink: 0 }} title={task.priority + " priority"} />
                              {taskOwner && <span className="avatar-circle" style={{ width: "24px", height: "24px", fontSize: "0.65rem" }} title={taskOwner.name}>{taskOwner.initials}</span>}
                              <select
                                value={task.status}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => { e.stopPropagation(); updateTaskStatus(task.id, e.target.value as TaskStatus); }}
                                style={{ borderRadius: "4px", padding: "3px 8px", fontSize: "0.75rem", cursor: "pointer" }}
                              >
                                <option value="NOT_STARTED">Not Started</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="BLOCKED">Blocked</option>
                                <option value="DONE">Done</option>
                              </select>
                            </>
                          ) : (
                            <span className={`status-badge ${task.status}`} style={{ fontSize: "0.75rem" }}>
                              {STATUS_LABEL_CUSTOMER[task.status] || task.status}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {msTasks.length === 0 && <div style={{ fontSize: "0.8rem", color: "var(--text-subtle)", fontStyle: "italic" }}>No tasks configured.</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {displayMode === "kanban" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "16px" }}>
          {[
            { key: "NOT_STARTED", title: viewMode === "internal" ? "TODO" : "SCHEDULED", color: "var(--text-subtle)" },
            { key: "IN_PROGRESS", title: "IN PROGRESS", color: "var(--status-completed-color)" },
            { key: "BLOCKED",     title: viewMode === "internal" ? "BLOCKED" : "NEEDS ATTENTION", color: viewMode === "internal" ? "var(--status-blocked-color)" : "var(--status-atrisk-color)" },
            { key: "DONE",        title: viewMode === "internal" ? "DONE" : "COMPLETED", color: "var(--status-ontrack-color)" },
          ].map((col) => {
            const colTasks = projectTasks.filter((t) => t.status === col.key);
            return (
              <div key={col.key} className="glass-panel" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: col.color, letterSpacing: "0.05em" }}>{col.title}</span>
                  <span style={{ fontSize: "0.75rem", background: "var(--bg-primary)", padding: "2px 8px", borderRadius: "10px", color: "var(--text-muted)", border: "1px solid var(--border-color)" }}>{colTasks.length}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", minHeight: "100px" }}>
                  {colTasks.map((t) => {
                    const owner = users.find((u) => u.id === t.ownerId);
                    const title = viewMode === "customer" && t.customerFacingTitle ? t.customerFacingTitle : t.title;
                    return (
                      <div key={t.id} onClick={() => setSelectedTask(t)} style={{ padding: "10px 12px", background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", display: "flex", flexDirection: "column", gap: "5px", cursor: "pointer", transition: "box-shadow 0.15s" }}
                        onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.08)")}
                        onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
                      >
                        <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-main)" }}>{title}</div>
                        {t.status === "BLOCKED" && (
                          <div style={{ fontSize: "0.75rem", color: viewMode === "internal" ? "#ef4444" : "#d97706" }}>
                            ⚠ {viewMode === "internal" ? (t.blocker || "Blocked") : (t.customerBlockerReason || "Waiting for access")}
                          </div>
                        )}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                          <span>{t.dueDate}</span>
                          {viewMode === "internal" && owner && <span className="avatar-circle" style={{ width: "20px", height: "20px", fontSize: "0.6rem" }}>{owner.initials}</span>}
                        </div>
                      </div>
                    );
                  })}
                  {colTasks.length === 0 && <div style={{ fontSize: "0.75rem", color: "var(--text-subtle)", textAlign: "center", padding: "20px 0" }}>Empty</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
