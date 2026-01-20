import { useState } from 'react';
import { AvatarTooltip } from '../../common/AvatarTooltip';

const CollaboratorItem = ({ collab, index }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    return (
        <div
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-900 overflow-hidden shrink-0 transition-transform hover:scale-110 cursor-pointer"
                style={{
                    backgroundColor: collab.color || "#ccc",
                    zIndex: 20 - index
                }}
            >
                {collab.photoURL ? <img src={collab.photoURL} className="w-full h-full object-cover" /> : collab.name?.charAt(0) || "?"}
            </div>
            <AvatarTooltip name={collab.name} photoURL={collab.photoURL} color={collab.color} show={showTooltip} />
        </div>
    );
};

export default CollaboratorItem;
