import React from 'react';

const GroupList = ({ groups, selectedGroupIds, onToggleGroup }) => {
    return (
        <div className="group-list" style={{ marginBottom: '3rem' }}>
            <div className="zara-sidebar-list">
                <button
                    className={`zara-sidebar-item ${selectedGroupIds.length === 0 ? 'active' : ''}`}
                    onClick={() => onToggleGroup(null)}
                >
                    <span className="zara-item-num">|01|</span>
                    VIEW ALL
                </button>
                {groups.map((group, index) => (
                    <button
                        key={group.id}
                        className={`zara-sidebar-item ${selectedGroupIds.includes(group.id) ? 'active' : ''}`}
                        onClick={() => onToggleGroup(group.id)}
                    >
                        <span className="zara-item-num">|{String(index + 2).padStart(2, '0')}|</span>
                        {group.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default GroupList;
