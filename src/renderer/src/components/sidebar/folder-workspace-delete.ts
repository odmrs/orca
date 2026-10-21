import type { AppState } from '@/store'
import type { ExecutionHostId } from '../../../../shared/execution-host'
import { folderWorkspaceKey } from '../../../../shared/workspace-scope'
import { blockRemovalForUnsavedFiles } from './removal-unsaved-files'

/**
 * The card action, context menu and hovered shortcut delete a folder workspace here: refused
 * while it holds unsaved editor text, and clears the selection when it was the active one.
 * Resolves null when refused.
 */
export function deleteFolderWorkspaceUnlessUnsaved(
  getState: () => AppState,
  folderWorkspaceId: string,
  executionHostId?: ExecutionHostId
): Promise<boolean> | null {
  const workspaceKey = folderWorkspaceKey(folderWorkspaceId)
  const name =
    getState().folderWorkspaces?.find((workspace) => workspace.id === folderWorkspaceId)?.name ??
    folderWorkspaceId
  // Why block, not confirm: the files stay on disk, so the user saves or closes them first.
  if (
    blockRemovalForUnsavedFiles(getState, [{ id: workspaceKey, hostId: executionHostId }], name)
  ) {
    return null
  }
  return getState()
    .deleteFolderWorkspace(folderWorkspaceId, executionHostId ? { executionHostId } : undefined)
    .then((deleted) => {
      const current = getState()
      if (
        deleted &&
        current.activeWorktreeId === workspaceKey &&
        (!executionHostId || current.activeWorkspaceExecutionHostId === executionHostId)
      ) {
        current.setActiveWorktree(null)
      }
      return deleted
    })
}
