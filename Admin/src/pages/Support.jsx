import { useState, useEffect } from 'react';
import { FaTicketAlt, FaFilter, FaSearch, FaEye, FaCheck, FaTimes, FaCalendar } from 'react-icons/fa';
import api from '../services/api';
import './Support.css';

const Support = () => {
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState(''); // No default date

    useEffect(() => {
        fetchTickets();
    }, []);

    useEffect(() => {
        filterTickets();
    }, [tickets, filterStatus, searchTerm, selectedDate]);

    const fetchTickets = async () => {
        try {
            const response = await api.get('/support');
            setTickets(response.tickets || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching tickets:', error);
            setTickets([]);
            setLoading(false);
        }
    };

    const filterTickets = () => {
        let filtered = tickets;

        // Filter by date
        if (selectedDate) {
            filtered = filtered.filter(ticket => {
                const ticketDate = new Date(ticket.createdAt).toISOString().split('T')[0];
                return ticketDate === selectedDate;
            });
        }

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(ticket => ticket.status === filterStatus);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(ticket =>
                ticket.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ticket.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ticket.issueType.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredTickets(filtered);
    };

    // Get count for each status
    const getStatusCount = (status) => {
        let filtered = tickets;

        // Apply date filter first
        if (selectedDate) {
            filtered = filtered.filter(ticket => {
                const ticketDate = new Date(ticket.createdAt).toISOString().split('T')[0];
                return ticketDate === selectedDate;
            });
        }

        if (status === 'all') return filtered.length;
        return filtered.filter(ticket => ticket.status === status).length;
    };

    const updateTicketStatus = async (ticketId, newStatus) => {
        try {
            await api.put(`/support/${ticketId}`, { status: newStatus });
            fetchTickets();
            setSelectedTicket(null);
        } catch (error) {
            console.error('Error updating ticket:', error);
        }
    };

    const handleViewTicket = async (ticket) => {
        setSelectedTicket(ticket);

        // Auto-update status to "In Progress" if current status is "Open"
        if (ticket.status === 'Open') {
            try {
                await api.put(`/support/${ticket._id}`, { status: 'In Progress' });
                fetchTickets();
            } catch (error) {
                console.error('Error updating ticket status:', error);
            }
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Open':
                return 'status-open';
            case 'In Progress':
                return 'status-progress';
            case 'Resolved':
                return 'status-resolved';
            case 'Closed':
                return 'status-closed';
            default:
                return '';
        }
    };

    const getPriorityBadgeClass = (priority) => {
        switch (priority) {
            case 'High':
                return 'priority-high';
            case 'Medium':
                return 'priority-medium';
            case 'Low':
                return 'priority-low';
            default:
                return '';
        }
    };

    return (
        <div className="support-page">
            <div className="page-header">
                <div>
                    <h1><FaTicketAlt /> Support Tickets</h1>
                    <p>Manage and resolve user support requests</p>
                </div>
            </div>

            {/* Filters */}
            <div className="support-filters-section">
                <div className="search-box">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search by name, email, or issue type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Date Filter */}
                <div className="date-filter">
                    <FaCalendar />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="date-input"
                    />
                </div>

                <div className="filter-buttons">
                    <button
                        className={filterStatus === 'Open' ? 'active' : ''}
                        onClick={() => setFilterStatus('Open')}
                    >
                        Open
                        <span className="count-badge">{getStatusCount('Open')}</span>
                    </button>
                    <button
                        className={filterStatus === 'In Progress' ? 'active' : ''}
                        onClick={() => setFilterStatus('In Progress')}
                    >
                        In Progress
                        <span className="count-badge">{getStatusCount('In Progress')}</span>
                    </button>
                    <button
                        className={filterStatus === 'Resolved' ? 'active' : ''}
                        onClick={() => setFilterStatus('Resolved')}
                    >
                        Resolved
                        <span className="count-badge">{getStatusCount('Resolved')}</span>
                    </button>
                    <button
                        className={filterStatus === 'all' ? 'active' : ''}
                        onClick={() => setFilterStatus('all')}
                    >
                        All
                        <span className="count-badge">{getStatusCount('all')}</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="tickets-table-container">
                    <table className="tickets-table">
                        <thead>
                            <tr>
                                <th>Ticket ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Issue Type</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...Array(5)].map((_, i) => (
                                <tr key={i} className="mgmt-skeleton-row">
                                    <td><div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '65px' }} /></td>
                                    <td><div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '110px' }} /></td>
                                    <td><div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '150px' }} /></td>
                                    <td><div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '90px' }} /></td>
                                    <td><div className="mgmt-skeleton mgmt-skeleton-badge" /></td>
                                    <td><div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '85px' }} /></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <div className="mgmt-skeleton mgmt-skeleton-btn" />
                                            <div className="mgmt-skeleton mgmt-skeleton-btn" />
                                            <div className="mgmt-skeleton mgmt-skeleton-btn" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
            <>
            {/* Tickets Table */}
            <div className="tickets-table-container">
                <table className="tickets-table">
                    <thead>
                        <tr>
                            <th>Ticket ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Issue Type</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTickets.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="no-data">
                                    No tickets found
                                </td>
                            </tr>
                        ) : (
                            filteredTickets.map((ticket) => (
                                <tr key={ticket._id}>
                                    <td>#{ticket._id.slice(-6)}</td>
                                    <td>{ticket.name}</td>
                                    <td>{ticket.email}</td>
                                    <td>{ticket.issueType}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusBadgeClass(ticket.status)}`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="action-btn action-btn-view"
                                                onClick={() => handleViewTicket(ticket)}
                                                title="View Details"
                                            >
                                                <FaEye />
                                            </button>
                                            {ticket.status !== 'Closed' && (
                                                <>
                                                    {ticket.status !== 'Resolved' && (
                                                        <button
                                                            className="action-btn action-btn-resolve"
                                                            onClick={() => updateTicketStatus(ticket._id, 'Resolved')}
                                                            title="Mark as Resolved"
                                                        >
                                                            <FaCheck />
                                                        </button>
                                                    )}
                                                    <button
                                                        className="action-btn action-btn-close"
                                                        onClick={() => updateTicketStatus(ticket._id, 'Closed')}
                                                        title="Close Ticket"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            </>
            )}

            {/* Ticket Detail Modal */}
            {selectedTicket && (
                <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
                    <div className="ticket-detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Ticket Details</h2>
                            <button onClick={() => setSelectedTicket(null)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-row">
                                <label>Ticket ID:</label>
                                <span>#{selectedTicket._id.slice(-6)}</span>
                            </div>
                            <div className="detail-row">
                                <label>Name:</label>
                                <span>{selectedTicket.name}</span>
                            </div>
                            <div className="detail-row">
                                <label>Email:</label>
                                <span>{selectedTicket.email}</span>
                            </div>
                            {selectedTicket.phone && (
                                <div className="detail-row">
                                    <label>Phone:</label>
                                    <span>{selectedTicket.phone}</span>
                                </div>
                            )}
                            <div className="detail-row">
                                <label>Issue Type:</label>
                                <span>{selectedTicket.issueType}</span>
                            </div>
                            <div className="detail-row">
                                <label>Status:</label>
                                <span className={`status-badge ${getStatusBadgeClass(selectedTicket.status)}`}>
                                    {selectedTicket.status}
                                </span>
                            </div>
                            <div className="detail-row">
                                <label>Priority:</label>
                                <span className={`priority-badge ${getPriorityBadgeClass(selectedTicket.priority)}`}>
                                    {selectedTicket.priority}
                                </span>
                            </div>
                            <div className="detail-row">
                                <label>Created:</label>
                                <span>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="detail-row full-width">
                                <label>Description:</label>
                                <p className="description">{selectedTicket.description}</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-secondary"
                                onClick={() => setSelectedTicket(null)}
                            >
                                Close
                            </button>
                            {selectedTicket.status !== 'Resolved' && (
                                <button
                                    className="btn-primary"
                                    onClick={() => updateTicketStatus(selectedTicket._id, 'Resolved')}
                                >
                                    Mark as Resolved
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Support;
