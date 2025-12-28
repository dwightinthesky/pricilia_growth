import React from 'react';
import HabitTracker from '../components/HabitTracker';
import UpcomingWidget from '../components/UpcomingWidget';
import HabitHeatmap from '../components/HabitHeatmap';
import TodoList from '../components/TodoList';
import DeadlineTimer from '../components/DeadlineTimer';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
    const { currentUser } = useAuth();

    // Protection
    if (!currentUser) {
        return <Navigate to="/" replace />;
    }

    return (
        <section className="py-24 border-t border-slate-200/50 bg-[#FFFCF8] min-h-screen">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-pricilia-dark mb-2">Welcome back, High Performer.</h2>
                    <p className="text-slate-500">Here is your daily overview.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)] max-w-7xl mx-auto">
                    {/* Top Left (Row Span 2): HabitTracker */}
                    <div className="md:row-span-2">
                        <HabitTracker />
                    </div>

                    {/* Top Right (Col Span 2): ConsistencyGraph */}
                    <div className="md:col-span-2">
                        <HabitHeatmap />
                    </div>

                    {/* Row 2 Middle: UpcomingWidget */}
                    <div>
                        <UpcomingWidget />
                    </div>

                    {/* Row 2 Right: DeadlineTimer */}
                    <div>
                        <DeadlineTimer />
                    </div>

                    {/* Bottom: TodoList (Full Width) */}
                    <div className="md:col-span-3">
                        <TodoList />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Dashboard;
