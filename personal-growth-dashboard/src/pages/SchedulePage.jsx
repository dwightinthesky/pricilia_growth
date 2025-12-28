import FullCalendar from '../components/FullCalendar';
import CommandKCoachmark from '../components/CommandKCoachmark';

export default function SchedulePage() {
    return (
        <>
            <CommandKCoachmark />
            <div className="h-[calc(100vh-64px)] px-6 py-6">
                <div className="h-full">
                    <FullCalendar height="100%" />
                </div>
            </div>
        </>
    );
}
