import React from 'react';

const BookList = ({ books, selectedBookIds, onToggleBook }) => {
    return (
        <div className="book-list" style={{ marginBottom: '3rem' }}>
            <div className="zara-sidebar-list">
                <button
                    className={`zara-sidebar-item ${selectedBookIds.length === 0 ? 'active' : ''}`}
                    onClick={() => onToggleBook(null)}
                >
                    <span className="zara-item-num">|01|</span>
                    ALL BOOKS
                </button>
                {books.map((book, index) => (
                    <button
                        key={book.id}
                        className={`zara-sidebar-item ${selectedBookIds.includes(book.id) ? 'active' : ''}`}
                        onClick={() => onToggleBook(book.id)}
                    >
                        <span className="zara-item-num">|{String(index + 2).padStart(2, '0')}|</span>
                        {book.code || book.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default BookList;
