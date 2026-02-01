import React from 'react';
import '../styles/components/SkeletonLoader.css';

const SkeletonLoader = ({ type = 'text', count = 1, width, height, className = '' }) => {
    const renderSkeleton = (index) => {
        const style = {};
        if (width) style.width = width;
        if (height) style.height = height;

        return (
            <div
                key={index}
                className={`skeleton skeleton-${type} ${className}`}
                style={style}
            ></div>
        );
    };

    return (
        <>
            {Array.from({ length: count }).map((_, index) => renderSkeleton(index))}
        </>
    );
};

export default SkeletonLoader;
