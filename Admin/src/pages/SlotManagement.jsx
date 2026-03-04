import { useState, useEffect } from 'react';
import { Clock, Calendar, Plus, Trash2, Save, AlertCircle, Coffee, CalendarOff, Timer, Ban, ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { slotConfigAPI } from '../services/api';
import './SlotManagement.css';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_FULL = { monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday' };
const WEEKDAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SlotManagement = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Working days
    const [workingDays, setWorkingDays] = useState(
        DAYS.map(day => ({
            day,
            enabled: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(day),
            startTime: '09:00',
            endTime: '17:00',
            breakStart: '13:00',
            breakEnd: '14:00'
        }))
    );

    // Date overrides
    const [dateOverrides, setDateOverrides] = useState([]);
    const [overrideForm, setOverrideForm] = useState({
        date: '',
        isHoliday: false,
        reason: '',
        customStartTime: '',
        customEndTime: ''
    });
    const [showOverrideForm, setShowOverrideForm] = useState(false);
    const [editingOverrideId, setEditingOverrideId] = useState(null);

    // Booking rules
    const [bookingRules, setBookingRules] = useState({
        minAdvanceBookingMinutes: 120,
        sameDayCutoffTime: '17:00'
    });

    // Max booking window
    const [maxBookingWindowDays, setMaxBookingWindowDays] = useState(20);

    // Calendar state
    const today = new Date();
    const [calMonth, setCalMonth] = useState(today.getMonth());
    const [calYear, setCalYear] = useState(today.getFullYear());
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const config = await slotConfigAPI.getMyConfig();
            if (config.workingDays?.length) setWorkingDays(config.workingDays);
            if (config.dateOverrides) setDateOverrides(config.dateOverrides);
            if (config.maxBookingWindowDays) setMaxBookingWindowDays(config.maxBookingWindowDays);
            setBookingRules({
                minAdvanceBookingMinutes: config.minAdvanceBookingMinutes ?? 120,
                sameDayCutoffTime: config.sameDayCutoffTime ?? '17:00'
            });
        } catch (error) {
            toast.error('Failed to load slot configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveWorkingDays = async () => {
        try {
            setSaving(true);
            await slotConfigAPI.updateWorkingDays({ workingDays });
            toast.success('Working days updated');
        } catch {
            toast.error('Failed to update working days');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveBookingRules = async () => {
        try {
            setSaving(true);
            await slotConfigAPI.updateBookingRules(bookingRules);
            toast.success('Booking rules updated');
        } catch {
            toast.error('Failed to update booking rules');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveOverride = async () => {
        if (!overrideForm.date) {
            toast.error('Please select a date');
            return;
        }
        try {
            setSaving(true);
            const config = await slotConfigAPI.upsertDateOverride(overrideForm);
            setDateOverrides(config.dateOverrides);
            setOverrideForm({ date: '', isHoliday: false, reason: '', customStartTime: '', customEndTime: '' });
            setShowOverrideForm(false);
            setEditingOverrideId(null);
            toast.success(editingOverrideId ? 'Override updated' : 'Override added');
        } catch {
            toast.error('Failed to save date override');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteOverride = async (id) => {
        try {
            const config = await slotConfigAPI.removeDateOverride(id);
            setDateOverrides(config.dateOverrides);
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

    const updateDay = (index, field, value) => {
        setWorkingDays(prev => prev.map((d, i) => i === index ? { ...d, [field]: value } : d));
    };

    const formatMinutes = (mins) => {
        if (mins < 60) return `${mins} min`;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
    };

    /* ─── Calendar Helpers ─── */
    const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

    const toLocalDateStr = (d) => {
        const dt = new Date(d);
        return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    };

    const getOverrideForDate = (dateStr) => {
        return dateOverrides.find(o => toLocalDateStr(o.date) === dateStr);
    };

    const getDayConfig = (jsDate) => {
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = dayNames[jsDate.getDay()];
        return workingDays.find(d => d.day === dayName);
    };

    const isToday = (day) => {
        return day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
    };

    const isWithinBookingWindow = (day) => {
        const date = new Date(calYear, calMonth, day);
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const maxDate = new Date(todayStart);
        maxDate.setDate(maxDate.getDate() + maxBookingWindowDays);
        return date <= maxDate && date >= todayStart;
    };

    const prevMonth = () => {
        if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
        else setCalMonth(calMonth - 1);
    };
    const nextMonth = () => {
        if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
        else setCalMonth(calMonth + 1);
    };

    const monthName = new Date(calYear, calMonth).toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(calMonth, calYear);
        const firstDay = getFirstDayOfMonth(calMonth, calYear);
        const cells = [];

        for (let i = 0; i < firstDay; i++) {
            cells.push(<div key={`empty-${i}`} className="cal-cell cal-empty"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const jsDate = new Date(calYear, calMonth, day);
            const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const override = getOverrideForDate(dateStr);
            const dayConfig = getDayConfig(jsDate);
            const withinWindow = isWithinBookingWindow(day);
            const isOff = dayConfig && !dayConfig.enabled;
            const isHoliday = override?.isHoliday;
            const hasOverride = !!override;
            const isSelected = selectedDate === dateStr;

            let cellClass = 'cal-cell';
            if (isToday(day)) cellClass += ' cal-today';
            if (isHoliday) cellClass += ' cal-holiday';
            else if (hasOverride) cellClass += ' cal-override';
            else if (isOff) cellClass += ' cal-off';
            if (withinWindow && !isOff && !isHoliday) cellClass += ' cal-bookable';
            if (isSelected) cellClass += ' cal-selected';

            cells.push(
                <div
                    key={day}
                    className={cellClass}
                    onClick={() => setSelectedDate(dateStr)}
                    title={
                        isHoliday ? `Holiday${override.reason ? ': ' + override.reason : ''}` :
                        hasOverride ? `Custom: ${override.customStartTime} - ${override.customEndTime}` :
                        isOff ? 'Day Off' :
                        dayConfig?.enabled ? `${dayConfig.startTime} - ${dayConfig.endTime}` : ''
                    }
                >
                    <span className="cal-day-num">{day}</span>
                    {dayConfig?.enabled && !isHoliday && (
                        <span className="cal-time-hint">
                            {hasOverride
                                ? `${override.customStartTime?.slice(0, 5)}-${override.customEndTime?.slice(0, 5)}`
                                : `${dayConfig.startTime?.slice(0, 5)}-${dayConfig.endTime?.slice(0, 5)}`}
                        </span>
                    )}
                    {isHoliday && <span className="cal-holiday-dot"></span>}
                    {hasOverride && !isHoliday && <span className="cal-override-dot"></span>}
                </div>
            );
        }

        return cells;
    };

    const getSelectedDateInfo = () => {
        if (!selectedDate) return null;
        const jsDate = new Date(selectedDate + 'T00:00:00');
        const override = getOverrideForDate(selectedDate);
        const dayConfig = getDayConfig(jsDate);
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayOfWeek = dayNames[jsDate.getDay()];
        return { jsDate, override, dayConfig, dayOfWeek };
    };

    if (loading) {
        return (
            <div className="slot-management p-4 lg:p-4">
                {/* Header Skeleton */}
                <div className="slot-header">
                    <div>
                        <div className="slot-sk slot-sk-text" style={{ width: 200, height: 28 }} />
                        <div className="slot-sk slot-sk-text" style={{ width: 360, height: 14, marginTop: 8 }} />
                    </div>
                </div>

                <div className="slot-two-col">
                    {/* Left Column */}
                    <div className="slot-left-col">
                        {/* Calendar Card Skeleton */}
                        <div className="slot-card">
                            <div className="slot-card-header">
                                <div className="slot-sk slot-sk-text" style={{ width: 180, height: 20 }} />
                            </div>
                            {/* Nav */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px' }}>
                                <div className="slot-sk" style={{ width: 32, height: 32, borderRadius: 8 }} />
                                <div className="slot-sk slot-sk-text" style={{ width: 140, height: 18 }} />
                                <div className="slot-sk" style={{ width: 32, height: 32, borderRadius: 8 }} />
                            </div>
                            {/* Legend */}
                            <div style={{ display: 'flex', gap: 16, padding: '8px 16px', flexWrap: 'wrap' }}>
                                {[80, 60, 65, 70, 90].map((w, i) => (
                                    <div key={i} className="slot-sk slot-sk-text" style={{ width: w, height: 12 }} />
                                ))}
                            </div>
                            {/* Calendar Grid 7x6 */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, padding: '8px 16px 16px' }}>
                                {['S','M','T','W','T','F','S'].map((d, i) => (
                                    <div key={i} style={{ textAlign: 'center', fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600, padding: 4 }}>{d}</div>
                                ))}
                                {Array.from({ length: 35 }).map((_, i) => (
                                    <div key={i} className="slot-sk" style={{ height: 38, borderRadius: 8 }} />
                                ))}
                            </div>
                        </div>

                        {/* Working Schedule Card Skeleton */}
                        <div className="slot-card">
                            <div className="slot-card-header">
                                <div className="slot-sk slot-sk-text" style={{ width: 170, height: 20 }} />
                                <div className="slot-sk slot-sk-text" style={{ width: 260, height: 12, marginTop: 6 }} />
                            </div>
                            <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {Array.from({ length: 7 }).map((_, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: '#f8f9fa', borderRadius: 10 }}>
                                        <div className="slot-sk" style={{ width: 36, height: 20, borderRadius: 10 }} />
                                        <div className="slot-sk slot-sk-text" style={{ width: 80, height: 14 }} />
                                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                                            <div className="slot-sk" style={{ width: 70, height: 28, borderRadius: 6 }} />
                                            <div className="slot-sk slot-sk-text" style={{ width: 16, height: 14 }} />
                                            <div className="slot-sk" style={{ width: 70, height: 28, borderRadius: 6 }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end' }}>
                                <div className="slot-sk" style={{ width: 130, height: 36, borderRadius: 8 }} />
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="slot-right-col">
                        {/* Booking Rules Card Skeleton */}
                        <div className="slot-card">
                            <div className="slot-card-header">
                                <div className="slot-sk slot-sk-text" style={{ width: 150, height: 20 }} />
                                <div className="slot-sk slot-sk-text" style={{ width: 280, height: 12, marginTop: 6 }} />
                            </div>
                            <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                                {/* Rule 1 - Slider */}
                                <div>
                                    <div className="slot-sk slot-sk-text" style={{ width: 220, height: 14 }} />
                                    <div className="slot-sk slot-sk-text" style={{ width: 300, height: 11, marginTop: 6 }} />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
                                        <div className="slot-sk" style={{ flex: 1, height: 6, borderRadius: 3 }} />
                                        <div className="slot-sk" style={{ width: 50, height: 24, borderRadius: 6 }} />
                                    </div>
                                </div>
                                {/* Rule 2 - Time Input */}
                                <div>
                                    <div className="slot-sk slot-sk-text" style={{ width: 190, height: 14 }} />
                                    <div className="slot-sk slot-sk-text" style={{ width: 240, height: 11, marginTop: 6 }} />
                                    <div className="slot-sk" style={{ width: 140, height: 36, borderRadius: 8, marginTop: 10 }} />
                                </div>
                                {/* Rule 3 - Read only */}
                                <div>
                                    <div className="slot-sk slot-sk-text" style={{ width: 170, height: 14 }} />
                                    <div className="slot-sk slot-sk-text" style={{ width: 280, height: 11, marginTop: 6 }} />
                                </div>
                                {/* Info Box */}
                                <div className="slot-sk" style={{ height: 56, borderRadius: 10 }} />
                            </div>
                            <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end' }}>
                                <div className="slot-sk" style={{ width: 120, height: 36, borderRadius: 8 }} />
                            </div>
                        </div>

                        {/* Date Overrides Card Skeleton */}
                        <div className="slot-card">
                            <div className="slot-card-header">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <div className="slot-sk slot-sk-text" style={{ width: 155, height: 20 }} />
                                    <div className="slot-sk" style={{ width: 100, height: 30, borderRadius: 8 }} />
                                </div>
                                <div className="slot-sk slot-sk-text" style={{ width: 270, height: 12, marginTop: 6 }} />
                            </div>
                            <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: '#f8f9fa', borderRadius: 10 }}>
                                        <div className="slot-sk" style={{ width: 44, height: 50, borderRadius: 8 }} />
                                        <div style={{ flex: 1 }}>
                                            <div className="slot-sk slot-sk-text" style={{ width: 160, height: 13 }} />
                                            <div className="slot-sk slot-sk-text" style={{ width: 100, height: 11, marginTop: 6 }} />
                                        </div>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <div className="slot-sk" style={{ width: 30, height: 30, borderRadius: 6 }} />
                                            <div className="slot-sk" style={{ width: 30, height: 30, borderRadius: 6 }} />
                                        </div>
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
        <div className="slot-management p-4 lg:p-4">
            {/* Page Header */}
            <div className="slot-header">
                <div>
                    <h1>Slot Management</h1>
                    <p>Configure your working hours, date overrides, and booking rules</p>
                </div>
            </div>

            {/* 2-Column Layout */}
            <div className="slot-two-col">
                {/* ═══════ LEFT COLUMN: Calendar + Working Schedule ═══════ */}
                <div className="slot-left-col">
                    {/* Calendar Card */}
                    <div className="slot-card">
                        <div className="slot-card-header">
                            <h2><Calendar size={18} /> Schedule Calendar</h2>
                        </div>
                        <div className="cal-nav">
                            <button className="cal-nav-btn" onClick={prevMonth}><ChevronLeft size={18} /></button>
                            <h3 className="cal-month-title">{monthName}</h3>
                            <button className="cal-nav-btn" onClick={nextMonth}><ChevronRight size={18} /></button>
                        </div>

                        <div className="cal-legend">
                            <span className="cal-legend-item"><span className="cal-dot dot-bookable"></span>Bookable</span>
                            <span className="cal-legend-item"><span className="cal-dot dot-off"></span>Day Off</span>
                            <span className="cal-legend-item"><span className="cal-dot dot-holiday"></span>Holiday</span>
                            <span className="cal-legend-item"><span className="cal-dot dot-override"></span>Override</span>
                            <span className="cal-legend-item"><span className="cal-dot dot-window"></span>Window ({maxBookingWindowDays}d)</span>
                        </div>

                        <div className="cal-grid">
                            {WEEKDAY_HEADERS.map(h => (
                                <div key={h} className="cal-header">{h}</div>
                            ))}
                            {renderCalendar()}
                        </div>

                        {/* Selected Date Info */}
                        {selectedDate && (() => {
                            const info = getSelectedDateInfo();
                            if (!info) return null;
                            const { jsDate, override, dayConfig, dayOfWeek } = info;
                            return (
                                <div className="cal-selected-info">
                                    <h4>{jsDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h4>
                                    {override?.isHoliday ? (
                                        <div className="cal-info-row cal-info-holiday">
                                            <CalendarOff size={14} />
                                            <span>Holiday{override.reason ? ` \u2014 ${override.reason}` : ''}</span>
                                        </div>
                                    ) : override ? (
                                        <div className="cal-info-row cal-info-override">
                                            <Clock size={14} />
                                            <span>Custom Hours: {override.customStartTime} \u2013 {override.customEndTime}</span>
                                            {override.reason && <span className="cal-info-reason">({override.reason})</span>}
                                        </div>
                                    ) : dayConfig?.enabled ? (
                                        <div className="cal-info-row cal-info-working">
                                            <Clock size={14} />
                                            <span>{dayConfig.startTime} \u2013 {dayConfig.endTime}</span>
                                            {dayConfig.breakStart && dayConfig.breakEnd && (
                                                <span className="cal-info-break"><Coffee size={12} /> Break: {dayConfig.breakStart} \u2013 {dayConfig.breakEnd}</span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="cal-info-row cal-info-off">
                                            <Ban size={14} />
                                            <span>{dayOfWeek} \u2014 Day Off</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>

                    {/* Working Schedule Card */}
                    <div className="slot-card">
                        <div className="slot-card-header">
                            <h2><Clock size={18} /> Working Schedule</h2>
                            <p>Set your availability for each day of the week</p>
                        </div>
                        <div className="schedule-list">
                            {workingDays.map((day, index) => (
                                <div key={day.day} className={`schedule-day ${!day.enabled ? 'schedule-day-off' : ''}`}>
                                    <div className="schedule-day-toggle">
                                        <button
                                            onClick={() => updateDay(index, 'enabled', !day.enabled)}
                                            className={`toggle-switch ${day.enabled ? 'toggle-on' : 'toggle-off'}`}
                                        >
                                            <span className="toggle-knob" />
                                        </button>
                                        <span className={`schedule-day-name ${day.enabled ? '' : 'text-muted'}`}>
                                            {DAY_FULL[day.day]}
                                        </span>
                                    </div>

                                    {day.enabled ? (
                                        <div className="schedule-day-times">
                                            <div className="time-group">
                                                <Clock size={14} className="time-icon" />
                                                <input type="time" value={day.startTime} onChange={e => updateDay(index, 'startTime', e.target.value)} />
                                                <span className="time-sep">to</span>
                                                <input type="time" value={day.endTime} onChange={e => updateDay(index, 'endTime', e.target.value)} />
                                            </div>
                                            <div className="time-group break-group">
                                                <Coffee size={14} className="time-icon break-icon" />
                                                <input type="time" value={day.breakStart} onChange={e => updateDay(index, 'breakStart', e.target.value)} />
                                                <span className="time-sep">to</span>
                                                <input type="time" value={day.breakEnd} onChange={e => updateDay(index, 'breakEnd', e.target.value)} />
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="day-off-label">Day off</span>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="slot-card-footer">
                            <button onClick={handleSaveWorkingDays} disabled={saving} className="btn-slot-primary">
                                <Save size={14} /> {saving ? 'Saving...' : 'Save Schedule'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ═══════ RIGHT COLUMN: Booking Rules + Date Overrides ═══════ */}
                <div className="slot-right-col">
                    {/* Booking Rules Card */}
                    <div className="slot-card">
                        <div className="slot-card-header">
                            <h2><Timer size={18} /> Booking Rules</h2>
                            <p>Control when patients can book appointments</p>
                        </div>

                        <div className="rules-body">
                            <div className="rule-field">
                                <label className="rule-label">
                                    <Timer size={16} className="rule-icon" />
                                    Minimum Advance Booking Time
                                </label>
                                <p className="rule-hint">
                                    How far in advance must patients book? Currently: <strong>{formatMinutes(bookingRules.minAdvanceBookingMinutes)}</strong>
                                </p>
                                <div className="rule-slider-row">
                                    <input
                                        type="range"
                                        min="30"
                                        max="1440"
                                        step="30"
                                        value={bookingRules.minAdvanceBookingMinutes}
                                        onChange={e => setBookingRules({ ...bookingRules, minAdvanceBookingMinutes: parseInt(e.target.value) })}
                                        className="rule-slider"
                                    />
                                    <span className="rule-slider-val">{formatMinutes(bookingRules.minAdvanceBookingMinutes)}</span>
                                </div>
                                <div className="rule-slider-labels">
                                    <span>30 min</span>
                                    <span>24 hours</span>
                                </div>
                            </div>

                            <div className="rule-field">
                                <label className="rule-label">
                                    <Ban size={16} className="rule-icon rule-icon-red" />
                                    Same-Day Booking Cutoff
                                </label>
                                <p className="rule-hint">No same-day bookings after this time</p>
                                <input
                                    type="time"
                                    value={bookingRules.sameDayCutoffTime}
                                    onChange={e => setBookingRules({ ...bookingRules, sameDayCutoffTime: e.target.value })}
                                    className="rule-time-input"
                                />
                            </div>

                            <div className="rule-field">
                                <label className="rule-label">
                                    <Calendar size={16} className="rule-icon" />
                                    Max Booking Window
                                </label>
                                <p className="rule-hint">Patients can book up to <strong>{maxBookingWindowDays} days</strong> in advance (set by Admin)</p>
                            </div>

                            <div className="rule-info-box">
                                <AlertCircle size={16} />
                                <div>
                                    <p className="rule-info-title">These rules apply to online bookings.</p>
                                    <p>Walk-in appointments booked through reception are not affected.</p>
                                </div>
                            </div>
                        </div>

                        <div className="slot-card-footer">
                            <button onClick={handleSaveBookingRules} disabled={saving} className="btn-slot-primary">
                                <Save size={14} /> {saving ? 'Saving...' : 'Save Rules'}
                            </button>
                        </div>
                    </div>

                    {/* Date Overrides Card */}
                    <div className="slot-card">
                        <div className="slot-card-header">
                            <div className="slot-card-header-row">
                                <h2><CalendarOff size={18} /> Date Overrides</h2>
                                {!showOverrideForm && (
                                    <button
                                        className="btn-slot-sm"
                                        onClick={() => {
                                            setShowOverrideForm(true);
                                            setEditingOverrideId(null);
                                            setOverrideForm({ date: '', isHoliday: false, reason: '', customStartTime: '', customEndTime: '' });
                                        }}
                                    >
                                        <Plus size={14} /> Add Override
                                    </button>
                                )}
                            </div>
                            <p>Set holidays or custom hours for specific dates</p>
                        </div>

                        {showOverrideForm && (
                            <div className="override-form">
                                <h4>{editingOverrideId ? 'Edit Override' : 'New Date Override'}</h4>
                                <div className="override-form-grid">
                                    <div className="override-field">
                                        <label>Date</label>
                                        <input
                                            type="date"
                                            value={overrideForm.date}
                                            onChange={e => setOverrideForm({ ...overrideForm, date: e.target.value })}
                                        />
                                    </div>
                                    <div className="override-field override-checkbox">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={overrideForm.isHoliday}
                                                onChange={e => setOverrideForm({
                                                    ...overrideForm,
                                                    isHoliday: e.target.checked,
                                                    customStartTime: e.target.checked ? '' : overrideForm.customStartTime,
                                                    customEndTime: e.target.checked ? '' : overrideForm.customEndTime
                                                })}
                                            />
                                            <CalendarOff size={14} className="holiday-icon" />
                                            Mark as Holiday
                                        </label>
                                    </div>

                                    {!overrideForm.isHoliday && (
                                        <>
                                            <div className="override-field">
                                                <label>Custom Start Time</label>
                                                <input
                                                    type="time"
                                                    value={overrideForm.customStartTime}
                                                    onChange={e => setOverrideForm({ ...overrideForm, customStartTime: e.target.value })}
                                                />
                                            </div>
                                            <div className="override-field">
                                                <label>Custom End Time</label>
                                                <input
                                                    type="time"
                                                    value={overrideForm.customEndTime}
                                                    onChange={e => setOverrideForm({ ...overrideForm, customEndTime: e.target.value })}
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div className="override-field override-field-full">
                                        <label>Reason (Optional)</label>
                                        <input
                                            type="text"
                                            value={overrideForm.reason}
                                            onChange={e => setOverrideForm({ ...overrideForm, reason: e.target.value })}
                                            placeholder="e.g. National Holiday, Training Day"
                                        />
                                    </div>
                                </div>

                                <div className="override-form-actions">
                                    <button onClick={handleSaveOverride} disabled={saving} className="btn-slot-primary">
                                        <Save size={14} /> {saving ? 'Saving...' : editingOverrideId ? 'Update' : 'Add Override'}
                                    </button>
                                    <button onClick={() => { setShowOverrideForm(false); setEditingOverrideId(null); }} className="btn-slot-secondary">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="override-list">
                            {dateOverrides.length > 0 ? (
                                dateOverrides.map(override => {
                                    const d = new Date(override.date);
                                    const isPast = d < new Date(new Date().setHours(0, 0, 0, 0));
                                    return (
                                        <div key={override._id} className={`override-item ${isPast ? 'override-past' : ''} ${override.isHoliday ? 'override-holiday' : 'override-custom'}`}>
                                            <div className="override-date-badge">
                                                <span className="override-date-num">{d.getDate()}</span>
                                                <span className="override-date-month">{d.toLocaleString('en-US', { month: 'short' })}</span>
                                            </div>
                                            <div className="override-detail">
                                                <p className="override-date-full">
                                                    {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                                <div className="override-meta">
                                                    {override.isHoliday ? (
                                                        <span className="override-tag tag-holiday"><CalendarOff size={12} /> Holiday</span>
                                                    ) : (
                                                        <span className="override-tag tag-custom"><Clock size={12} /> {override.customStartTime} \u2013 {override.customEndTime}</span>
                                                    )}
                                                    {override.reason && <span className="override-reason">{override.reason}</span>}
                                                </div>
                                            </div>
                                            <div className="override-actions">
                                                <button onClick={() => handleEditOverride(override)} className="override-edit-btn" title="Edit">
                                                    <Edit2 size={14} />
                                                </button>
                                                <button onClick={() => handleDeleteOverride(override._id)} className="override-delete-btn" title="Delete">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="override-empty">
                                    <Calendar size={32} />
                                    <p>No date overrides configured</p>
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

export default SlotManagement;
