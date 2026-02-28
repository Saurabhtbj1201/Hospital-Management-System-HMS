import { useState, useEffect } from 'react';
import {
    Clock, Save, Settings, Coffee, Timer, CalendarDays, Hash, CalendarOff,
    Edit2, Ban, ChevronLeft, ChevronRight, Trash2, Plus, AlertCircle,
    Users, RefreshCw, CheckCircle, X
} from 'lucide-react';
import { toast } from 'sonner';
import { slotDefaultsAPI } from '../services/api';
import './SlotSettings.css';

const DAY_FULL = { monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday' };
const WEEKDAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SlotSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Global defaults
    const [defaults, setDefaults] = useState({
        maxBookingWindowDays: 20,
        defaultSlotDurationMinutes: 30,
        defaultWorkingHoursStart: '09:00',
        defaultWorkingHoursEnd: '17:00',
        defaultBreakStart: '13:00',
        defaultBreakEnd: '14:00',
        defaultDailyCapacity: 30
    });

    // Shared slot config (working schedule, booking rules, overrides)
    const [sharedConfig, setSharedConfig] = useState(null);

    // Edit states
    const [editingSchedule, setEditingSchedule] = useState(false);
    const [editWorkingDays, setEditWorkingDays] = useState([]);
    const [editingRules, setEditingRules] = useState(false);
    const [editRules, setEditRules] = useState({ minAdvanceBookingMinutes: 120, sameDayCutoffTime: '17:00' });

    // Override form
    const [showOverrideForm, setShowOverrideForm] = useState(false);
    const [editingOverrideId, setEditingOverrideId] = useState(null);
    const [overrideForm, setOverrideForm] = useState({
        date: '', isHoliday: false, reason: '', customStartTime: '', customEndTime: ''
    });

    // Calendar
    const today = new Date();
    const [calMonth, setCalMonth] = useState(today.getMonth());
    const [calYear, setCalYear] = useState(today.getFullYear());

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [defaultsRes, configsRes] = await Promise.all([
                slotDefaultsAPI.getDefaults(),
                slotDefaultsAPI.getAllConfigs()
            ]);
            const dData = defaultsRes.data || defaultsRes;
            setDefaults({
                maxBookingWindowDays: dData.maxBookingWindowDays ?? 20,
                defaultSlotDurationMinutes: dData.defaultSlotDurationMinutes ?? 30,
                defaultWorkingHoursStart: dData.defaultWorkingHoursStart ?? '09:00',
                defaultWorkingHoursEnd: dData.defaultWorkingHoursEnd ?? '17:00',
                defaultBreakStart: dData.defaultBreakStart ?? '13:00',
                defaultBreakEnd: dData.defaultBreakEnd ?? '14:00',
                defaultDailyCapacity: dData.defaultDailyCapacity ?? 30
            });
            const cData = configsRes.data || configsRes;
            const shared = Array.isArray(cData) ? cData.find(c => c.key === 'shared') || cData[0] : cData;
            if (shared) setSharedConfig(shared);
        } catch {
            toast.error('Failed to load slot settings');
        } finally {
            setLoading(false);
        }
    };

    /* ─── Defaults ─── */
    const handleSaveDefaults = async () => {
        try {
            setSaving(true);
            const res = await slotDefaultsAPI.updateDefaults(defaults);
            const d = res.data || res;
            setDefaults({
                maxBookingWindowDays: d.maxBookingWindowDays,
                defaultSlotDurationMinutes: d.defaultSlotDurationMinutes,
                defaultWorkingHoursStart: d.defaultWorkingHoursStart,
                defaultWorkingHoursEnd: d.defaultWorkingHoursEnd,
                defaultBreakStart: d.defaultBreakStart,
                defaultBreakEnd: d.defaultBreakEnd,
                defaultDailyCapacity: d.defaultDailyCapacity
            });
            toast.success('Global defaults updated');
        } catch {
            toast.error('Failed to update defaults');
        } finally {
            setSaving(false);
        }
    };

    /* ─── Schedule Edit ─── */
    const startEditSchedule = () => {
        setEditWorkingDays(sharedConfig.workingDays.map(d => ({ ...d })));
        setEditingSchedule(true);
    };
    const cancelEditSchedule = () => { setEditingSchedule(false); setEditWorkingDays([]); };
    const updateEditDay = (idx, field, value) => {
        setEditWorkingDays(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d));
    };
    const handleSaveSchedule = async () => {
        try {
            setSaving(true);
            const res = await slotDefaultsAPI.updateConfigById(sharedConfig._id, { workingDays: editWorkingDays });
            const updated = res.data || res;
            setSharedConfig(updated);
            setEditingSchedule(false);
            toast.success('Working schedule updated');
        } catch {
            toast.error('Failed to update schedule');
        } finally {
            setSaving(false);
        }
    };

    /* ─── Rules Edit ─── */
    const startEditRules = () => {
        setEditRules({
            minAdvanceBookingMinutes: sharedConfig.minAdvanceBookingMinutes,
            sameDayCutoffTime: sharedConfig.sameDayCutoffTime
        });
        setEditingRules(true);
    };
    const cancelEditRules = () => setEditingRules(false);
    const handleSaveRules = async () => {
        try {
            setSaving(true);
            const res = await slotDefaultsAPI.updateConfigById(sharedConfig._id, editRules);
            const updated = res.data || res;
            setSharedConfig(updated);
            setEditingRules(false);
            toast.success('Booking rules updated');
        } catch {
            toast.error('Failed to update rules');
        } finally {
            setSaving(false);
        }
    };

    /* ─── Date Overrides ─── */
    const toLocalDateStr = (d) => {
        const dt = new Date(d);
        return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    };

    const handleSaveOverride = async () => {
        if (!overrideForm.date) { toast.error('Please select a date'); return; }
        try {
            setSaving(true);
            // Admin updates via updateConfigById — we need to build the new dateOverrides array
            const overrides = [...(sharedConfig.dateOverrides || [])];
            const targetDate = new Date(overrideForm.date);
            targetDate.setHours(0, 0, 0, 0);
            const newOverride = {
                date: targetDate,
                isHoliday: overrideForm.isHoliday,
                reason: overrideForm.reason,
                customStartTime: overrideForm.customStartTime,
                customEndTime: overrideForm.customEndTime
            };

            const existingIdx = overrides.findIndex(o => toLocalDateStr(o.date) === overrideForm.date);
            if (existingIdx >= 0) {
                overrides[existingIdx] = { ...overrides[existingIdx], ...newOverride };
            } else {
                overrides.push(newOverride);
            }
            overrides.sort((a, b) => new Date(a.date) - new Date(b.date));

            const res = await slotDefaultsAPI.updateConfigById(sharedConfig._id, { dateOverrides: overrides });
            const updated = res.data || res;
            setSharedConfig(updated);
            setOverrideForm({ date: '', isHoliday: false, reason: '', customStartTime: '', customEndTime: '' });
            setShowOverrideForm(false);
            setEditingOverrideId(null);
            toast.success(editingOverrideId ? 'Override updated' : 'Override added');
        } catch {
            toast.error('Failed to save override');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteOverride = async (overrideId) => {
        try {
            const overrides = sharedConfig.dateOverrides.filter(o => o._id !== overrideId);
            const res = await slotDefaultsAPI.updateConfigById(sharedConfig._id, { dateOverrides: overrides });
            const updated = res.data || res;
            setSharedConfig(updated);
            toast.success('Override removed');
        } catch {
            toast.error('Failed to remove override');
        }
    };

    const handleEditOverride = (override) => {
        setEditingOverrideId(override._id);
        setOverrideForm({
            date: toLocalDateStr(override.date),
            isHoliday: override.isHoliday,
            reason: override.reason || '',
            customStartTime: override.customStartTime || '',
            customEndTime: override.customEndTime || ''
        });
        setShowOverrideForm(true);
    };

    const formatMinutes = (mins) => {
        if (mins < 60) return `${mins} min`;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
    };

    /* ─── Calendar Helpers ─── */
    const getDaysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
    const getFirstDayOfMonth = (m, y) => new Date(y, m, 1).getDay();
    const getOverrideForDate = (dateStr) => {
        return (sharedConfig?.dateOverrides || []).find(o => toLocalDateStr(o.date) === dateStr);
    };
    const getDayConfig = (jsDate) => {
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return (sharedConfig?.workingDays || []).find(d => d.day === dayNames[jsDate.getDay()]);
    };
    const isToday = (day) => day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();

    const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); };
    const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); };
    const monthName = new Date(calYear, calMonth).toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(calMonth, calYear);
        const firstDay = getFirstDayOfMonth(calMonth, calYear);
        const cells = [];
        for (let i = 0; i < firstDay; i++) cells.push(<div key={`e-${i}`} className="as-cal-cell as-cal-empty"></div>);
        for (let day = 1; day <= daysInMonth; day++) {
            const jsDate = new Date(calYear, calMonth, day);
            const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const override = getOverrideForDate(dateStr);
            const dayConfig = getDayConfig(jsDate);
            const isOff = dayConfig && !dayConfig.enabled;
            const isHoliday = override?.isHoliday;
            const hasOverride = !!override;

            let cls = 'as-cal-cell';
            if (isToday(day)) cls += ' as-cal-today';
            if (isHoliday) cls += ' as-cal-holiday';
            else if (hasOverride) cls += ' as-cal-override';
            else if (isOff) cls += ' as-cal-off';
            else if (dayConfig?.enabled) cls += ' as-cal-working';

            cells.push(
                <div key={day} className={cls} title={
                    isHoliday ? `Holiday${override.reason ? ': ' + override.reason : ''}` :
                    hasOverride ? `Custom: ${override.customStartTime}-${override.customEndTime}` :
                    isOff ? 'Day Off' :
                    dayConfig?.enabled ? `${dayConfig.startTime}-${dayConfig.endTime}` : ''
                }>
                    <span className="as-cal-num">{day}</span>
                    {isHoliday && <span className="as-cal-dot as-dot-holiday"></span>}
                    {hasOverride && !isHoliday && <span className="as-cal-dot as-dot-override"></span>}
                </div>
            );
        }
        return cells;
    };

    /* ─── Stats ─── */
    const enabledDays = sharedConfig?.workingDays?.filter(d => d.enabled) || [];
    const overrideCount = sharedConfig?.dateOverrides?.length || 0;
    const upcomingOverrides = (sharedConfig?.dateOverrides || []).filter(o => new Date(o.date) >= new Date(new Date().setHours(0, 0, 0, 0)));

    if (loading) {
        return (
            <div className="admin-slot-settings p-4 lg:p-6">
                {/* Header skeleton */}
                <div className="as-header">
                    <div>
                        <div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '180px', height: '22px', marginBottom: '8px' }} />
                        <div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '340px', height: '12px' }} />
                    </div>
                    <div className="mgmt-skeleton" style={{ width: '90px', height: '34px', borderRadius: '8px' }} />
                </div>

                {/* Stats row skeleton */}
                <div className="as-stats-row">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="as-stat-card">
                            <div className="mgmt-skeleton" style={{ width: '38px', height: '38px', borderRadius: '9px' }} />
                            <div>
                                <div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '40px', height: '18px', marginBottom: '6px' }} />
                                <div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '75px', height: '10px' }} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Two column skeleton */}
                <div className="as-two-col">
                    <div className="as-col">
                        {/* Card 1 */}
                        <div className="as-card">
                            <div className="as-card-header">
                                <div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '160px', height: '16px', marginBottom: '6px' }} />
                                <div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '260px', height: '11px' }} />
                            </div>
                            <div className="as-card-body">
                                <div className="as-defaults-grid">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="as-field">
                                            <div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '110px', height: '11px', marginBottom: '8px' }} />
                                            <div className="mgmt-skeleton" style={{ width: '100%', height: '36px', borderRadius: '8px' }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="as-card-footer">
                                <div className="mgmt-skeleton" style={{ width: '110px', height: '34px', borderRadius: '7px' }} />
                            </div>
                        </div>
                        {/* Card 2 */}
                        <div className="as-card">
                            <div className="as-card-header">
                                <div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '140px', height: '16px', marginBottom: '6px' }} />
                                <div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '220px', height: '11px' }} />
                            </div>
                            <div className="as-card-body">
                                <div className="as-schedule-grid">
                                    {[...Array(7)].map((_, i) => (
                                        <div key={i} className="mgmt-skeleton" style={{ height: '60px', borderRadius: '8px' }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="as-col">
                        {/* Calendar card */}
                        <div className="as-card">
                            <div className="as-card-header">
                                <div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '120px', height: '16px' }} />
                            </div>
                            <div className="as-card-body">
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                                    {[...Array(35)].map((_, i) => (
                                        <div key={i} className="mgmt-skeleton" style={{ height: '32px', borderRadius: '6px' }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                        {/* Overrides card */}
                        <div className="as-card">
                            <div className="as-card-header">
                                <div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '130px', height: '16px', marginBottom: '6px' }} />
                                <div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '200px', height: '11px' }} />
                            </div>
                            <div className="as-card-body">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                                        <div className="mgmt-skeleton" style={{ width: '42px', height: '48px', borderRadius: '8px' }} />
                                        <div style={{ flex: 1 }}>
                                            <div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '120px', height: '13px', marginBottom: '6px' }} />
                                            <div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '80px', height: '10px' }} />
                                        </div>
                                        <div className="mgmt-skeleton mgmt-skeleton-btn" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-slot-settings p-4 lg:p-6">
            {/* Header */}
            <div className="as-header">
                <div>
                    <h1>Slot Settings</h1>
                    <p>Full control over scheduling, defaults, overrides, and receptionist configurations</p>
                </div>
                <button onClick={fetchData} className="as-refresh-btn" title="Refresh">
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {/* Quick Stats */}
            <div className="as-stats-row">
                <div className="as-stat-card">
                    <div className="as-stat-icon as-stat-blue"><Clock size={18} /></div>
                    <div>
                        <p className="as-stat-value">{enabledDays.length}</p>
                        <p className="as-stat-label">Working Days</p>
                    </div>
                </div>
                <div className="as-stat-card">
                    <div className="as-stat-icon as-stat-green"><Timer size={18} /></div>
                    <div>
                        <p className="as-stat-value">{defaults.defaultSlotDurationMinutes}m</p>
                        <p className="as-stat-label">Slot Duration</p>
                    </div>
                </div>
                <div className="as-stat-card">
                    <div className="as-stat-icon as-stat-purple"><CalendarDays size={18} /></div>
                    <div>
                        <p className="as-stat-value">{defaults.maxBookingWindowDays}d</p>
                        <p className="as-stat-label">Booking Window</p>
                    </div>
                </div>
                <div className="as-stat-card">
                    <div className="as-stat-icon as-stat-red"><CalendarOff size={18} /></div>
                    <div>
                        <p className="as-stat-value">{upcomingOverrides.length}</p>
                        <p className="as-stat-label">Upcoming Overrides</p>
                    </div>
                </div>
                <div className="as-stat-card">
                    <div className="as-stat-icon as-stat-amber"><Hash size={18} /></div>
                    <div>
                        <p className="as-stat-value">{defaults.defaultDailyCapacity}</p>
                        <p className="as-stat-label">Daily Capacity</p>
                    </div>
                </div>
            </div>

            {/* Main 2-Column Layout */}
            <div className="as-two-col">
                {/* ═══ LEFT COLUMN ═══ */}
                <div className="as-col">
                    {/* Global Slot Defaults */}
                    <div className="as-card">
                        <div className="as-card-header">
                            <h2><Settings size={18} /> Global Slot Defaults</h2>
                            <p>These defaults apply when the shared config is created</p>
                        </div>
                        <div className="as-card-body">
                            <div className="as-defaults-grid">
                                <div className="as-field">
                                    <label><CalendarDays size={14} className="as-field-icon as-icon-blue" /> Max Booking Window</label>
                                    <div className="as-field-row">
                                        <input type="number" min="1" max="90" value={defaults.maxBookingWindowDays}
                                            onChange={e => setDefaults({ ...defaults, maxBookingWindowDays: parseInt(e.target.value) || 0 })} />
                                        <span>days</span>
                                    </div>
                                </div>
                                <div className="as-field">
                                    <label><Timer size={14} className="as-field-icon as-icon-green" /> Slot Duration</label>
                                    <select value={defaults.defaultSlotDurationMinutes}
                                        onChange={e => setDefaults({ ...defaults, defaultSlotDurationMinutes: parseInt(e.target.value) })}>
                                        <option value={10}>10 min</option>
                                        <option value={15}>15 min</option>
                                        <option value={20}>20 min</option>
                                        <option value={30}>30 min</option>
                                        <option value={45}>45 min</option>
                                        <option value={60}>60 min</option>
                                    </select>
                                </div>
                                <div className="as-field">
                                    <label><Clock size={14} className="as-field-icon as-icon-green" /> Working Hours</label>
                                    <div className="as-field-row">
                                        <input type="time" value={defaults.defaultWorkingHoursStart}
                                            onChange={e => setDefaults({ ...defaults, defaultWorkingHoursStart: e.target.value })} />
                                        <span>to</span>
                                        <input type="time" value={defaults.defaultWorkingHoursEnd}
                                            onChange={e => setDefaults({ ...defaults, defaultWorkingHoursEnd: e.target.value })} />
                                    </div>
                                </div>
                                <div className="as-field">
                                    <label><Coffee size={14} className="as-field-icon as-icon-amber" /> Break Time</label>
                                    <div className="as-field-row">
                                        <input type="time" value={defaults.defaultBreakStart}
                                            onChange={e => setDefaults({ ...defaults, defaultBreakStart: e.target.value })} />
                                        <span>to</span>
                                        <input type="time" value={defaults.defaultBreakEnd}
                                            onChange={e => setDefaults({ ...defaults, defaultBreakEnd: e.target.value })} />
                                    </div>
                                </div>
                                <div className="as-field">
                                    <label><Hash size={14} className="as-field-icon as-icon-purple" /> Daily Capacity</label>
                                    <div className="as-field-row">
                                        <input type="number" min="1" max="200" value={defaults.defaultDailyCapacity}
                                            onChange={e => setDefaults({ ...defaults, defaultDailyCapacity: parseInt(e.target.value) || 0 })} />
                                        <span>patients/day</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="as-card-footer">
                            <button onClick={handleSaveDefaults} disabled={saving} className="as-btn-primary">
                                <Save size={14} /> {saving ? 'Saving...' : 'Save Defaults'}
                            </button>
                        </div>
                    </div>

                    {/* Booking Rules */}
                    <div className="as-card">
                        <div className="as-card-header">
                            <div className="as-card-header-row">
                                <h2><Timer size={18} /> Booking Rules</h2>
                                {!editingRules && sharedConfig && (
                                    <button className="as-btn-edit" onClick={startEditRules}><Edit2 size={13} /> Edit</button>
                                )}
                            </div>
                            <p>Patient booking constraints configured by receptionists</p>
                        </div>

                        {sharedConfig ? (
                            !editingRules ? (
                                <div className="as-card-body">
                                    <div className="as-rules-display">
                                        <div className="as-rule-item">
                                            <Timer size={16} className="as-rule-icon" />
                                            <div>
                                                <p className="as-rule-name">Minimum Advance Booking</p>
                                                <p className="as-rule-value">{formatMinutes(sharedConfig.minAdvanceBookingMinutes)}</p>
                                            </div>
                                        </div>
                                        <div className="as-rule-item">
                                            <Ban size={16} className="as-rule-icon as-icon-red" />
                                            <div>
                                                <p className="as-rule-name">Same-Day Cutoff</p>
                                                <p className="as-rule-value">{sharedConfig.sameDayCutoffTime}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="as-card-body">
                                    <div className="as-edit-rules">
                                        <div className="as-field">
                                            <label>Min Advance Booking (minutes)</label>
                                            <input type="number" min="0" max="1440" value={editRules.minAdvanceBookingMinutes}
                                                onChange={e => setEditRules({ ...editRules, minAdvanceBookingMinutes: parseInt(e.target.value) || 0 })} />
                                        </div>
                                        <div className="as-field">
                                            <label>Same-Day Cutoff Time</label>
                                            <input type="time" value={editRules.sameDayCutoffTime}
                                                onChange={e => setEditRules({ ...editRules, sameDayCutoffTime: e.target.value })} />
                                        </div>
                                        <div className="as-edit-actions">
                                            <button onClick={handleSaveRules} disabled={saving} className="as-btn-primary">
                                                <Save size={14} /> {saving ? 'Saving...' : 'Save Rules'}
                                            </button>
                                            <button onClick={cancelEditRules} className="as-btn-secondary">Cancel</button>
                                        </div>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="as-card-body as-empty-state">
                                <p>No shared config created yet</p>
                            </div>
                        )}
                    </div>

                    {/* Receptionist Config Info */}
                    <div className="as-card">
                        <div className="as-card-header">
                            <h2><Users size={18} /> Receptionist Configuration</h2>
                            <p>Shared config \u2014 all receptionists use the same settings</p>
                        </div>
                        <div className="as-card-body">
                            {sharedConfig ? (
                                <div className="as-config-info">
                                    <div className="as-config-status">
                                        <CheckCircle size={16} className="as-icon-green" />
                                        <span>Shared configuration is <strong>active</strong></span>
                                    </div>
                                    {sharedConfig.lastModifiedBy && (
                                        <div className="as-config-modified">
                                            <p className="as-modified-label">Last Modified By</p>
                                            <div className="as-modified-user">
                                                <div className="as-user-avatar">
                                                    {sharedConfig.lastModifiedBy.name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className="as-user-name">{sharedConfig.lastModifiedBy.name}</p>
                                                    <p className="as-user-email">{sharedConfig.lastModifiedBy.email}</p>
                                                </div>
                                            </div>
                                            {sharedConfig.updatedAt && (
                                                <p className="as-modified-time">
                                                    {new Date(sharedConfig.updatedAt).toLocaleString('en-IN', {
                                                        day: 'numeric', month: 'short', year: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    <div className="as-config-summary">
                                        <div className="as-summary-item">
                                            <span className="as-summary-label">Working Days</span>
                                            <span className="as-summary-value">{enabledDays.map(d => DAY_FULL[d.day]?.slice(0, 3)).join(', ')}</span>
                                        </div>
                                        <div className="as-summary-item">
                                            <span className="as-summary-label">Advance Booking</span>
                                            <span className="as-summary-value">{formatMinutes(sharedConfig.minAdvanceBookingMinutes)}</span>
                                        </div>
                                        <div className="as-summary-item">
                                            <span className="as-summary-label">Cutoff</span>
                                            <span className="as-summary-value">{sharedConfig.sameDayCutoffTime}</span>
                                        </div>
                                        <div className="as-summary-item">
                                            <span className="as-summary-label">Date Overrides</span>
                                            <span className="as-summary-value">{overrideCount} total ({upcomingOverrides.length} upcoming)</span>
                                        </div>
                                    </div>

                                    <div className="as-info-box">
                                        <AlertCircle size={15} />
                                        <span>Any receptionist\u0027s changes apply to all. Admin can override from here.</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="as-empty-state">
                                    <Users size={28} />
                                    <p>No shared configuration yet</p>
                                    <span>It will be created when any receptionist accesses Slot Management</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ═══ RIGHT COLUMN ═══ */}
                <div className="as-col">
                    {/* Working Schedule + Calendar */}
                    <div className="as-card">
                        <div className="as-card-header">
                            <div className="as-card-header-row">
                                <h2><Clock size={18} /> Working Schedule</h2>
                                {!editingSchedule && sharedConfig && (
                                    <button className="as-btn-edit" onClick={startEditSchedule}><Edit2 size={13} /> Edit</button>
                                )}
                            </div>
                            <p>Current weekly working hours</p>
                        </div>

                        {sharedConfig ? (
                            !editingSchedule ? (
                                <>
                                    {/* Mini calendar */}
                                    <div className="as-mini-cal">
                                        <div className="as-cal-nav">
                                            <button onClick={prevMonth} className="as-cal-nav-btn"><ChevronLeft size={16} /></button>
                                            <span className="as-cal-month">{monthName}</span>
                                            <button onClick={nextMonth} className="as-cal-nav-btn"><ChevronRight size={16} /></button>
                                        </div>
                                        <div className="as-cal-grid">
                                            {WEEKDAY_HEADERS.map(h => <div key={h} className="as-cal-hdr">{h}</div>)}
                                            {renderCalendar()}
                                        </div>
                                        <div className="as-cal-legend">
                                            <span><span className="as-legend-dot as-ld-working"></span>Working</span>
                                            <span><span className="as-legend-dot as-ld-off"></span>Off</span>
                                            <span><span className="as-legend-dot as-ld-holiday"></span>Holiday</span>
                                            <span><span className="as-legend-dot as-ld-override"></span>Override</span>
                                        </div>
                                    </div>

                                    {/* Schedule grid */}
                                    <div className="as-schedule-grid">
                                        {sharedConfig.workingDays.map(day => (
                                            <div key={day.day} className={`as-sched-day ${day.enabled ? 'as-sched-active' : 'as-sched-off'}`}>
                                                <span className="as-sched-name">{DAY_FULL[day.day]?.slice(0, 3)}</span>
                                                {day.enabled ? (
                                                    <>
                                                        <span className="as-sched-time">{day.startTime}\u2013{day.endTime}</span>
                                                        {day.breakStart && <span className="as-sched-break">Break: {day.breakStart}\u2013{day.breakEnd}</span>}
                                                    </>
                                                ) : (
                                                    <span className="as-sched-off-label">Off</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                /* Edit schedule */
                                <div className="as-card-body">
                                    <div className="as-edit-schedule">
                                        {editWorkingDays.map((day, idx) => (
                                            <div key={day.day} className={`as-edit-day ${!day.enabled ? 'as-edit-day-off' : ''}`}>
                                                <div className="as-edit-day-toggle">
                                                    <button
                                                        onClick={() => updateEditDay(idx, 'enabled', !day.enabled)}
                                                        className={`as-toggle ${day.enabled ? 'as-toggle-on' : 'as-toggle-off'}`}
                                                    >
                                                        <span className="as-toggle-knob" />
                                                    </button>
                                                    <span className={day.enabled ? '' : 'as-text-muted'}>{DAY_FULL[day.day]}</span>
                                                </div>
                                                {day.enabled ? (
                                                    <div className="as-edit-day-times">
                                                        <div className="as-time-pair">
                                                            <Clock size={13} className="as-time-icon" />
                                                            <input type="time" value={day.startTime} onChange={e => updateEditDay(idx, 'startTime', e.target.value)} />
                                                            <span>to</span>
                                                            <input type="time" value={day.endTime} onChange={e => updateEditDay(idx, 'endTime', e.target.value)} />
                                                        </div>
                                                        <div className="as-time-pair">
                                                            <Coffee size={13} className="as-time-icon as-icon-amber" />
                                                            <input type="time" value={day.breakStart} onChange={e => updateEditDay(idx, 'breakStart', e.target.value)} />
                                                            <span>to</span>
                                                            <input type="time" value={day.breakEnd} onChange={e => updateEditDay(idx, 'breakEnd', e.target.value)} />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="as-text-muted as-text-sm">Day off</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="as-edit-actions" style={{ padding: '12px 0 0' }}>
                                        <button onClick={handleSaveSchedule} disabled={saving} className="as-btn-primary">
                                            <Save size={14} /> {saving ? 'Saving...' : 'Save Schedule'}
                                        </button>
                                        <button onClick={cancelEditSchedule} className="as-btn-secondary">Cancel</button>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="as-card-body as-empty-state">
                                <Clock size={28} />
                                <p>No schedule configured yet</p>
                            </div>
                        )}
                    </div>

                    {/* Date Overrides */}
                    <div className="as-card">
                        <div className="as-card-header">
                            <div className="as-card-header-row">
                                <h2><CalendarOff size={18} /> Date Overrides</h2>
                                {!showOverrideForm && sharedConfig && (
                                    <button className="as-btn-sm" onClick={() => {
                                        setShowOverrideForm(true);
                                        setEditingOverrideId(null);
                                        setOverrideForm({ date: '', isHoliday: false, reason: '', customStartTime: '', customEndTime: '' });
                                    }}>
                                        <Plus size={14} /> Add
                                    </button>
                                )}
                            </div>
                            <p>Holidays and custom hours for specific dates</p>
                        </div>

                        {/* Override Form */}
                        {showOverrideForm && (
                            <div className="as-override-form">
                                <h4>{editingOverrideId ? 'Edit Override' : 'New Override'}</h4>
                                <div className="as-override-form-grid">
                                    <div className="as-field">
                                        <label>Date</label>
                                        <input type="date" value={overrideForm.date}
                                            onChange={e => setOverrideForm({ ...overrideForm, date: e.target.value })} />
                                    </div>
                                    <div className="as-field as-field-check">
                                        <label className="as-checkbox-label">
                                            <input type="checkbox" checked={overrideForm.isHoliday}
                                                onChange={e => setOverrideForm({
                                                    ...overrideForm, isHoliday: e.target.checked,
                                                    customStartTime: e.target.checked ? '' : overrideForm.customStartTime,
                                                    customEndTime: e.target.checked ? '' : overrideForm.customEndTime
                                                })} />
                                            <CalendarOff size={13} className="as-icon-red" />
                                            Mark as Holiday
                                        </label>
                                    </div>
                                    {!overrideForm.isHoliday && (
                                        <>
                                            <div className="as-field">
                                                <label>Start Time</label>
                                                <input type="time" value={overrideForm.customStartTime}
                                                    onChange={e => setOverrideForm({ ...overrideForm, customStartTime: e.target.value })} />
                                            </div>
                                            <div className="as-field">
                                                <label>End Time</label>
                                                <input type="time" value={overrideForm.customEndTime}
                                                    onChange={e => setOverrideForm({ ...overrideForm, customEndTime: e.target.value })} />
                                            </div>
                                        </>
                                    )}
                                    <div className="as-field as-field-full">
                                        <label>Reason (optional)</label>
                                        <input type="text" value={overrideForm.reason}
                                            onChange={e => setOverrideForm({ ...overrideForm, reason: e.target.value })}
                                            placeholder="e.g. National Holiday" />
                                    </div>
                                </div>
                                <div className="as-edit-actions">
                                    <button onClick={handleSaveOverride} disabled={saving} className="as-btn-primary">
                                        <Save size={14} /> {saving ? 'Saving...' : editingOverrideId ? 'Update' : 'Add'}
                                    </button>
                                    <button onClick={() => { setShowOverrideForm(false); setEditingOverrideId(null); }} className="as-btn-secondary">Cancel</button>
                                </div>
                            </div>
                        )}

                        {/* Override List */}
                        <div className="as-override-list">
                            {(sharedConfig?.dateOverrides || []).length > 0 ? (
                                sharedConfig.dateOverrides.map(o => {
                                    const d = new Date(o.date);
                                    const isPast = d < new Date(new Date().setHours(0, 0, 0, 0));
                                    return (
                                        <div key={o._id} className={`as-override-item ${isPast ? 'as-override-past' : ''}`}>
                                            <div className={`as-override-badge ${o.isHoliday ? 'as-badge-holiday' : 'as-badge-custom'}`}>
                                                <span className="as-badge-day">{d.getDate()}</span>
                                                <span className="as-badge-month">{d.toLocaleString('en-US', { month: 'short' })}</span>
                                            </div>
                                            <div className="as-override-detail">
                                                <p className="as-override-date">
                                                    {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                                <div className="as-override-meta">
                                                    {o.isHoliday ? (
                                                        <span className="as-tag as-tag-holiday"><CalendarOff size={11} /> Holiday</span>
                                                    ) : (
                                                        <span className="as-tag as-tag-custom"><Clock size={11} /> {o.customStartTime}\u2013{o.customEndTime}</span>
                                                    )}
                                                    {o.reason && <span className="as-override-reason">{o.reason}</span>}
                                                </div>
                                            </div>
                                            <div className="as-override-actions">
                                                <button onClick={() => handleEditOverride(o)} title="Edit"><Edit2 size={13} /></button>
                                                <button onClick={() => handleDeleteOverride(o._id)} title="Delete" className="as-del"><Trash2 size={13} /></button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="as-empty-state">
                                    <CalendarOff size={28} />
                                    <p>No date overrides</p>
                                    <span>Add holidays or custom hours for specific dates</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SlotSettings;