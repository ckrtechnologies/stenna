import React from 'react';

const CategoryList = ({ categories, selectedCategoryIds, onToggleCategory }) => {
    if (categories.length === 0) return null;

    return (
        <div className="category-list">
            <div className="zara-sidebar-list">
                <button
                    className={`zara-sidebar-item ${selectedCategoryIds.length === 0 ? 'active' : ''}`}
                    onClick={() => onToggleCategory(null)}
                >
                    <span className="zara-item-num">|01|</span>
                    VIEW ALL
                </button>
                {categories.map((category, index) => (
                    <button
                        key={category.id}
                        className={`zara-sidebar-item ${selectedCategoryIds.includes(category.id) ? 'active' : ''}`}
                        onClick={() => onToggleCategory(category.id)}
                    >
                        <span className="zara-item-num">|{String(index + 2).padStart(2, '0')}|</span>
                        {category.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoryList;
