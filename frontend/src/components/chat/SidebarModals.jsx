import CreateGroupModal from "./CreateGroupModal";
import ConfirmModal from "../common/ConfirmModal";
import ConversationInfoModal from "./ConversationInfoModal";

const SidebarModals = ({
    isGroupModalOpen,
    setIsGroupModalOpen,
    confirmAction,
    setConfirmAction,
    handleConfirmAction,
    infoModalConversation,
    setInfoModalConversation
}) => {
    return (
        <>
            <CreateGroupModal
                isOpen={isGroupModalOpen}
                onClose={() => setIsGroupModalOpen(false)}
            />

            <ConfirmModal
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={handleConfirmAction}
                title={
                    confirmAction?.type === 'leave' ? "Leave Group" :
                        confirmAction?.payload?.isGroup ? "Delete Group" : "Delete Conversation"
                }
                message={
                    confirmAction?.type === 'leave'
                        ? "Are you sure you want to leave this group?"
                        : confirmAction?.payload?.isGroup
                            ? "Are you sure you want to delete this group? This action cannot be undone and will remove it for all members."
                            : "Are you sure you want to delete this conversation?"
                }
                confirmText={confirmAction?.type === 'leave' ? "Leave" : "Delete"}
                isDanger={true}
            />

            <ConversationInfoModal
                isOpen={!!infoModalConversation}
                onClose={() => setInfoModalConversation(null)}
                conversation={infoModalConversation}
            />
        </>
    );
};

export default SidebarModals;
