import React from 'react';
import QuickCaptureCard from './QuickCaptureCard';

export default function QuickActZone({ onCapture }) {
    return (
        <div className="overview-action-card">
            <QuickCaptureCard onCapture={onCapture} />
        </div>
    );
}
