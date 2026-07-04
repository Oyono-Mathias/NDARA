import React from 'react';
import { AdminNavigation } from '../AdminNavigation';

export function AdminSidebar({ isSidebarOpen, onClose }: { isSidebarOpen: boolean, onClose: () => void }) {
    return <AdminNavigation isSidebarOpen={isSidebarOpen} onClose={onClose} />;
}
