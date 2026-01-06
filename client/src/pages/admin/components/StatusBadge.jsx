import React from 'react';

const StatusBadge = ({ status }) => {
    const styles = {
        draft: 'bg-gray-100 text-gray-700 border-gray-200',
        published: 'bg-green-100 text-green-700 border-green-200',
        archived: 'bg-orange-100 text-orange-700 border-orange-200'
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.draft} capitalize`}>
            {status || 'draft'}
        </span>
    );
};

export default StatusBadge;
