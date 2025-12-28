import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            nav: { overview: "Overview", schedules: "Schedules", database: "Database", goals: "Extra*up", chores: "Chores", logout: "Logout", ask_howie: "Ask Howie" },
            dashboard: {
                system_online: "System Online",
                good_morning: "Good Morning",
                good_afternoon: "Good Afternoon",
                good_evening: "Good Evening",
                guest: "Guest",
                subtitle: "Daily Overview",
                date_locale: "en-US",
                new_task: "New Task",
                add_expense: "Add Expense",
                monthly_spend: "Monthly Spend",
                tasks_completed: "Tasks Completed",
                consistency_score: "Consistency Score",
                upcoming_deadlines: "Upcoming Deadlines",
                focus_activity: "Focus Activity",
                focus_subtitle: "Your deep work sessions over the last 7 days.",
                recent_activity: "Recent Activity",
                view_all: "View All"
            },
            kpi: {
                next_7_days: "Next 7 Days"
            },
            tasks: {
                title: "TASKS",
                placeholder: "Add a new task...",
                empty: "No tasks yet.",
                delete_confirm: "Delete this task?"
            },
            upcoming: {
                today: "TODAY'S SCHEDULE",
                upcoming: "UPCOMING",
                no_classes: "No classes found.",
                check_settings: "Check Calendar Settings"
            },
            timer: {
                title: "COUNTDOWN TIMER",
                next_class: "NEXT CLASS",
                expired: "EXPIRED",
                no_classes: "No Classes",
                link_calendar: "Link Calendar in Upcoming",
                days: "DAYS",
                hours: "HOURS",
                settings: "Settings",
                goal_title: "Goal Title",
                target_date: "Target Date & Time",
                save_changes: "Save Changes"
            },
            progress: {
                title: "DAILY PROGRESS",
                completed: "Tasks Completed"
            },
            chores: {
                title: "Chores & Bills",
                subtitle: "Manage recurring household tasks and monthly payments.",
                add_item: "Add Item",
                monthly_bills: "Monthly Bills",
                household_tasks: "Household Tasks",
                no_bills: "No bills yet.",
                no_chores: "No chores yet.",
                save: "Save",
                cancel: "Cancel",
                type_bill: "Bill ($)",
                type_chore: "Chore (🏠)",
                freq_monthly: "Monthly",
                freq_weekly: "Weekly",
                placeholder: "Type naturally...",
                pending: "Pending",
                new_chore: "New Chore",
                cat_all: "All",
                cat_home: "Home",
                cat_bills: "Bills",
                cat_shopping: "Shopping",
                clear_filters: "Clear Filters"
            },
            heatmap: {
                consistency: "CONSISTENCY",
                less: "Less",
                more: "More"
            },
            goals: {
                title: "Extra*up",
                subtitle: "Level up your skills and achieve long-term goals.",
                new_goal: "New Goal",
                milestones: "Milestones",
                add_step: "Add Step",
                delete_goal: "Delete Goal",
                create_title: "Create New Goal",
                add: "Add",
                cancel: "Cancel",
                placeholder_title: "Goal Title (e.g. Learn React)",
                empty: "No goals yet. Start by adding one!",
                login_msg: "Please login to manage goals"
            },
            database: {
                title: "Database",
                subtitle: "Master view of all your cloud data.",
                search: "Search...",
                empty: "Database is empty."
            },
            schedule: {
                title: "Schedules",
                subtitle: "Manage your classes and personal tasks.",
                syncing: "Syncing Calendar..."
            },
            howie: {
                title: "Howie AI",
                subtitle: "Your personal life assistant",
                placeholder: "Tell me what you want to schedule, track, or achieve...",
                analyze: "Analyze Intent",
                analyzing: "Analyzing...",
                preview: "Preview Action",
                edit: "Edit",
                confirm: "Confirm & Save",
                syncing: "Syncing...",
                type: "Type",
                priority: "Priority"
            },
            landing: {
                hero_title: "Growth Automated.",
                hero_subtitle: "The operating system for your life.",
                get_started: "Get Started",
                student_discount: "Student discount available",
                login: "Log in",
                signup: "Sign up"
            },
            common: {
                platform: "Platform",
                preference: "Preference",
                settings: "Settings",
                assistant: "Assistant",
                ask_howie: "Ask Howie"
            },
            sidebar: {
                overview: "Overview",
                schedules: "Schedules",
                database: "Database",
                extra_up: "Extra*up",
                chores: "Chores"
            }
        }
    },
    "zh-TW": {
        translation: {
            nav: { overview: "總覽", schedules: "行事曆", database: "資料庫", goals: "成長目標", chores: "雜務帳單", logout: "登出", ask_howie: "詢問 Howie" },
            dashboard: {
                system_online: "系統上線",
                good_morning: "早安",
                good_afternoon: "午安",
                good_evening: "晚安",
                guest: "訪客",
                subtitle: "每日總覽",
                date_locale: "zh-TW",
                new_task: "新增任務",
                add_expense: "記帳",
                monthly_spend: "本月支出",
                tasks_completed: "任務完成",
                consistency_score: "一致性分數",
                upcoming_deadlines: "即將截止",
                focus_activity: "專注活動",
                focus_subtitle: "過去 7 天的深度工作時數。",
                recent_activity: "近期活動",
                view_all: "查看全部"
            },
            kpi: {
                next_7_days: "未來 7 天"
            },
            tasks: {
                title: "待辦事項",
                placeholder: "新增任務...",
                empty: "目前沒有任務",
                delete_confirm: "確定刪除此任務？"
            },
            upcoming: {
                today: "今日行程",
                upcoming: "即將到來",
                no_classes: "沒有課程",
                check_settings: "檢查行事曆設定"
            },
            timer: {
                title: "倒數計時",
                next_class: "下一堂課",
                expired: "已過期",
                no_classes: "無課程",
                link_calendar: "請先連結行事曆",
                days: "天",
                hours: "小時",
                settings: "設定",
                goal_title: "目標標題",
                target_date: "目標日期與時間",
                save_changes: "儲存變更"
            },
            progress: {
                title: "今日進度",
                completed: "完成任務"
            },
            chores: {
                title: "雜務與帳單",
                subtitle: "管理週期性家務與每月帳單。",
                add_item: "新增項目",
                monthly_bills: "每月帳單",
                household_tasks: "家務雜事",
                no_bills: "尚無帳單",
                no_chores: "尚無雜務",
                save: "儲存",
                cancel: "取消",
                type_bill: "帳單 ($)",
                type_chore: "家務 (🏠)",
                freq_monthly: "每月",
                freq_weekly: "每週",
                placeholder: "自然輸入...",
                pending: "待辦",
                new_chore: "新增雜務",
                cat_all: "全部",
                cat_home: "家庭",
                cat_bills: "帳單",
                cat_shopping: "購物",
                clear_filters: "清除篩選"
            },
            heatmap: {
                consistency: "持續性",
                less: "少",
                more: "多"
            },
            goals: {
                title: "成長目標",
                subtitle: "升級你的技能並達成長期目標。",
                new_goal: "新目標",
                milestones: "里程碑",
                add_step: "新增步驟",
                delete_goal: "刪除目標",
                create_title: "建立新目標",
                add: "新增",
                cancel: "取消",
                placeholder_title: "目標名稱 (例如：學會 React)",
                empty: "還沒有設定目標，現在就開始吧！",
                login_msg: "請先登入以管理目標"
            },
            database: {
                title: "資料庫",
                subtitle: "雲端資料總覽。",
                search: "搜尋...",
                empty: "資料庫是空的"
            },
            schedule: {
                title: "行事曆",
                subtitle: "管理你的課程與私人行程。",
                syncing: "同步行事曆中..."
            },
            howie: {
                title: "Howie AI",
                subtitle: "你的私人生活秘書",
                placeholder: "告訴我你想安排什麼行程、記帳或設定目標...",
                analyze: "分析意圖",
                analyzing: "分析中...",
                preview: "預覽動作",
                edit: "編輯",
                confirm: "確認並儲存",
                syncing: "同步中...",
                type: "類型",
                priority: "優先級"
            },
            landing: {
                hero_title: "自動化你的成長。",
                hero_subtitle: "專為高成就者打造的人生作業系統。",
                get_started: "免費開始",
                student_discount: "學生專屬優惠",
                login: "登入",
                signup: "註冊"
            },
            common: {
                platform: "平台",
                preference: "偏好設定",
                settings: "設定",
                assistant: "AI 助手",
                ask_howie: "詢問 Howie"
            },
            sidebar: {
                overview: "總覽",
                schedules: "行程表",
                database: "資料庫",
                extra_up: "Extra*up 目標",
                chores: "家務雜事"
            }
        }
    },
    hu: {
        translation: {
            nav: { overview: "Áttekintés", schedules: "Napirend", database: "Adatbázis", goals: "Célok", chores: "Feladatok", logout: "Kijelentkezés", ask_howie: "Kérdezze Howie-t" },
            dashboard: {
                system_online: "Rendszer Online",
                good_morning: "Jó reggelt",
                good_afternoon: "Jó napot",
                good_evening: "Jó estét",
                guest: "Vendég",
                subtitle: "Napi Áttekintés",
                date_locale: "hu-HU",
                new_task: "Új feladat",
                add_expense: "Kiadás hozzáadása",
                monthly_spend: "Havi kiadás",
                tasks_completed: "Befejezett feladatok",
                consistency_score: "Következetességi pontszám",
                upcoming_deadlines: "Közelgő határidők",
                focus_activity: "Fókusz tevékenység",
                focus_subtitle: "Mély munkamenetei az elmúlt 7 napban.",
                recent_activity: "Legutóbbi tevékenység",
                view_all: "Összes megtekintése"
            },
            kpi: {
                next_7_days: "Következő 7 nap"
            },
            tasks: {
                title: "FELADATOK",
                placeholder: "Új feladat hozzáadása...",
                empty: "Nincs feladat.",
                delete_confirm: "Törli ezt a feladatot?"
            },
            upcoming: {
                today: "MAI ÓRAREND",
                upcoming: "KÖVETKEZŐ",
                no_classes: "Nincsenek órák.",
                check_settings: "Ellenőrizze a naptár beállításait"
            },
            timer: {
                title: "VISSZASZÁMLÁLÓ",
                next_class: "KÖVETKEZŐ ÓRA",
                expired: "LEJÁRT",
                no_classes: "Nincs óra",
                link_calendar: "Naptár összekapcsolása",
                days: "NAP",
                hours: "ÓRA",
                settings: "Beállítások",
                goal_title: "Cél Címe",
                target_date: "Cél Dátum és Idő",
                save_changes: "Változások Mentése"
            },
            progress: {
                title: "NAPI HALADÁS",
                completed: "Elvégzett feladatok"
            },
            chores: {
                title: "Számlák és Teendők",
                subtitle: "Ismétlődő háztartási feladatok és havi fizetések kezelése.",
                add_item: "Tétel hozzáadása",
                monthly_bills: "Havi számlák",
                household_tasks: "Háztartási feladatok",
                no_bills: "Nincs számla.",
                no_chores: "Nincs teendő.",
                save: "Mentés",
                cancel: "Mégse",
                type_bill: "Számla ($)",
                type_chore: "Házimunka (🏠)",
                freq_monthly: "Havi",
                freq_weekly: "Heti",
                placeholder: "Írjon természetesen...",
                pending: "Függőben",
                new_chore: "Új Feladat",
                cat_all: "Összes",
                cat_home: "Otthon",
                cat_bills: "Számlák",
                cat_shopping: "Bevásárlás",
                clear_filters: "Szűrők Törlése"
            },
            heatmap: {
                consistency: "KÖVETKEZETESSÉG",
                less: "Kevesebb",
                more: "Több"
            },
            goals: {
                title: "Célok",
                subtitle: "Fejlessze készségeit és érje el hosszú távú céljait.",
                new_goal: "Új cél",
                milestones: "Mérföldkövek",
                add_step: "Lépés hozzáadása",
                delete_goal: "Cél törlése",
                create_title: "Új cél létrehozása",
                add: "Hozzáadás",
                cancel: "Mégse",
                placeholder_title: "Cél címe (pl. React megtanulása)",
                empty: "Még nincsenek célok. Kezdje egy hozzáadásával!",
                login_msg: "Kérjük, jelentkezzen be a célok kezeléséhez"
            },
            database: {
                title: "Adatbázis",
                subtitle: "Felhőadatok fő nézete.",
                search: "Keresés...",
                empty: "Az adatbázis üres."
            },
            schedule: {
                title: "Napirend",
                subtitle: "Kezelje óráit és személyes feladatait.",
                syncing: "Naptár szinkronizálása..."
            },
            howie: {
                title: "Howie AI",
                subtitle: "Személyi asszisztense",
                placeholder: "Mondja el, mit szeretne ütemezni, nyomon követni vagy elérni...",
                analyze: "Elemzés",
                analyzing: "Elemzés...",
                preview: "Előnézet",
                edit: "Szerkesztés",
                confirm: "Megerősítés és Mentés",
                syncing: "Szinkronizálás...",
                type: "Típus",
                priority: "Prioritás"
            },
            landing: {
                hero_title: "Automatizált Növekedés.",
                hero_subtitle: "Operációs rendszer az élete számára.",
                get_started: "Kezdés",
                student_discount: "Diákkedvezmény elérhető",
                login: "Bejelentkezés",
                signup: "Regisztráció"
            },
            common: {
                platform: "Platform",
                preference: "Beállítások",
                settings: "Beállítások",
                assistant: "Asszisztens",
                ask_howie: "Kérdezze Howie-t"
            },
            sidebar: {
                overview: "Áttekintés",
                schedules: "Napirend",
                database: "Adatbázis",
                extra_up: "Célok",
                chores: "Feladatok"
            }
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: { escapeValue: false }
    });

export default i18n;
