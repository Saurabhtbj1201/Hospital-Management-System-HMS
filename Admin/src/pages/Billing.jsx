import { useState, useEffect, useRef } from 'react';
import { FileText, Eye, Edit2, Printer, X, Search, RefreshCw, ChevronLeft, ChevronRight, Plus, Trash2, IndianRupee, BarChart3, Download, Filter, ChevronDown, Loader2, CheckCircle } from 'lucide-react';
import { billingAPI, departmentsAPI, invoiceTemplateAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import './Billing.css';

const RS = '\u20B9';

/* ================================================================
   GENERATE INVOICE MODAL
   ================================================================ */
const GenerateInvoiceModal = ({ appointment, onClose, onGenerated }) => {
    const [services, setServices] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [roundOff, setRoundOff] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [departmentServices, setDepartmentServices] = useState([]);
    const [showServicePicker, setShowServicePicker] = useState(false);

    useEffect(() => {
        fetchDoctorFee();
    }, []);

    const fetchDoctorFee = async () => {
        try {
            const res = await billingAPI.getDoctorFee(appointment._id);
            const { doctorFee, doctorName, department } = res.data;
            const initialServices = [];

            // Add department default consultation fee
            if (department && department.defaultConsultationFee > 0) {
                initialServices.push({
                    name: `Default Consultation Fee (${department.name})`,
                    description: `Department consultation fee`,
                    amount: department.defaultConsultationFee,
                    isDefault: true
                });
            }

            // Add doctor consultation fee
            if (doctorFee > 0) {
                initialServices.push({
                    name: 'Doctor Consultation Fee',
                    description: `Consultation with Dr. ${doctorName}`,
                    amount: doctorFee
                });
            }

            setServices(initialServices);

            // Store department services for the service picker
            if (department && department.services && department.services.length > 0) {
                setDepartmentServices(department.services);
            }
        } catch {
            toast.error('Failed to fetch doctor fee');
        } finally {
            setLoading(false);
        }
    };

    const addService = () => {
        setShowServicePicker(true);
    };

    const addDepartmentService = (deptService) => {
        setServices([...services, {
            name: deptService.serviceName,
            description: deptService.description || '',
            amount: deptService.fee
        }]);
        setShowServicePicker(false);
    };

    const addCustomService = () => {
        setServices([...services, { name: '', description: '', amount: 0 }]);
        setShowServicePicker(false);
    };

    const removeService = (index) => {
        setServices(services.filter((_, i) => i !== index));
    };

    const updateService = (index, field, value) => {
        const updated = [...services];
        updated[index] = { ...updated[index], [field]: field === 'amount' ? Number(value) : value };
        setServices(updated);
    };

    const subtotal = services.reduce((sum, s) => sum + Number(s.amount || 0), 0);
    const total = Math.max(0, subtotal - Number(discount) + Number(roundOff));

    const handleSubmit = async () => {
        if (services.length === 0) {
            toast.error('Add at least one service');
            return;
        }
        const invalidService = services.find(s => !s.name.trim() || s.amount <= 0);
        if (invalidService) {
            toast.error('All services must have a name and valid amount');
            return;
        }

        setSubmitting(true);
        try {
            await billingAPI.generateInvoice(appointment._id, {
                services,
                discount: Number(discount),
                roundOff: Number(roundOff)
            });
            toast.success('Invoice generated successfully');
            onGenerated();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to generate invoice');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="billing-modal-overlay" onClick={onClose}>
            <div className="billing-modal generate-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2><FileText size={20} /> Generate Invoice</h2>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="modal-body">
                    {/* Appointment Info */}
                    <div className="appointment-info-card">
                        <div className="info-row">
                            <span>Patient:</span><strong>{appointment.fullName}</strong>
                        </div>
                        <div className="info-row">
                            <span>Appointment ID:</span><strong>{appointment.appointmentId}</strong>
                        </div>
                        <div className="info-row">
                            <span>Department:</span><strong>{appointment.department || 'N/A'}</strong>
                        </div>
                        <div className="info-row">
                            <span>Doctor:</span><strong>{appointment.doctorName ? `Dr. ${appointment.doctorName}` : 'Not Assigned'}</strong>
                        </div>
                        <div className="info-row">
                            <span>Date:</span><strong>{new Date(appointment.appointmentDate).toLocaleDateString('en-IN')}</strong>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-text">Fetching doctor fee...</div>
                    ) : (
                        <>
                            {/* Services */}
                            <div className="services-section">
                                <div className="section-header">
                                    <h3>Services</h3>
                                    <button className="add-service-btn" onClick={addService}>
                                        <Plus size={14} /> Add Service
                                    </button>
                                </div>

                                {/* Service Picker Dropdown */}
                                {showServicePicker && (
                                    <div className="service-picker-dropdown">
                                        <div className="service-picker-header">
                                            <span>Select a service or create custom</span>
                                            <button className="close-picker-btn" onClick={() => setShowServicePicker(false)}><X size={14} /></button>
                                        </div>
                                        {departmentServices.length > 0 && (
                                            <div className="dept-services-list">
                                                <p className="picker-section-label">Department Services ({appointment.department || 'N/A'})</p>
                                                {departmentServices.map((ds, idx) => (
                                                    <button
                                                        key={idx}
                                                        className="dept-service-item"
                                                        onClick={() => addDepartmentService(ds)}
                                                    >
                                                        <span className="ds-name">{ds.serviceName}</span>
                                                        <span className="ds-fee">{RS}{ds.fee}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        <div className="custom-service-option">
                                            <button className="custom-service-btn" onClick={addCustomService}>
                                                <Plus size={14} /> Create Custom Service
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {services.length === 0 && !showServicePicker && (
                                    <p className="no-services-text">No services added. Click "Add Service" to begin.</p>
                                )}

                                {services.map((service, index) => (
                                    <div key={index} className={`service-row ${service.isDefault ? 'default-fee-row' : ''}`}>
                                        <div className="service-field">
                                            <label>Service Name</label>
                                            <input
                                                type="text"
                                                value={service.name}
                                                onChange={e => updateService(index, 'name', e.target.value)}
                                                placeholder="e.g. Blood Test"
                                            />
                                        </div>
                                        <div className="service-field">
                                            <label>Description</label>
                                            <input
                                                type="text"
                                                value={service.description}
                                                onChange={e => updateService(index, 'description', e.target.value)}
                                                placeholder="Optional"
                                            />
                                        </div>
                                        <div className="service-field amount-field">
                                            <label>Amount ({RS})</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={service.amount}
                                                onChange={e => updateService(index, 'amount', e.target.value)}
                                            />
                                        </div>
                                        <button className="remove-service-btn" onClick={() => removeService(index)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Discount & Round-off */}
                            <div className="adjustments-section">
                                <div className="adjustment-field">
                                    <label>Discount ({RS})</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={discount}
                                        onChange={e => setDiscount(e.target.value)}
                                    />
                                </div>
                                <div className="adjustment-field">
                                    <label>Round Off ({RS})</label>
                                    <input
                                        type="number"
                                        value={roundOff}
                                        onChange={e => setRoundOff(e.target.value)}
                                    />
                                    <span className="hint">Use negative to round down</span>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="bill-summary">
                                <div className="summary-row">
                                    <span>Subtotal:</span>
                                    <span>{RS}{subtotal.toFixed(2)}</span>
                                </div>
                                {Number(discount) > 0 && (
                                    <div className="summary-row discount">
                                        <span>Discount:</span>
                                        <span>- {RS}{Number(discount).toFixed(2)}</span>
                                    </div>
                                )}
                                {Number(roundOff) !== 0 && (
                                    <div className="summary-row">
                                        <span>Round Off:</span>
                                        <span>{Number(roundOff) >= 0 ? '+' : ''} {RS}{Number(roundOff).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="summary-row total">
                                    <span>Total:</span>
                                    <span>{RS}{total.toFixed(2)}</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={handleSubmit} disabled={submitting || loading}>
                        {submitting ? 'Generating...' : 'Generate Invoice'}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ================================================================
   VIEW INVOICE MODAL (editable payment + printable)
   ================================================================ */
const ViewInvoiceModal = ({ billId, appointment, onClose, onUpdated }) => {
    const [bill, setBill] = useState(null);
    const [loading, setLoading] = useState(true);
    const [template, setTemplate] = useState(null);
    const [qrDataUrl, setQrDataUrl] = useState('');
    const printRef = useRef();

    // Editable payment fields
    const [paymentMethod, setPaymentMethod] = useState('');
    const [paidAmount, setPaidAmount] = useState(0);
    const [transactionId, setTransactionId] = useState('');
    const [savingPayment, setSavingPayment] = useState(false);
    const [paymentDirty, setPaymentDirty] = useState(false);

    useEffect(() => {
        fetchBill();
        fetchTemplate();
    }, []);

    const fetchBill = async () => {
        try {
            const res = await billingAPI.getBillById(billId);
            const b = res.data;
            setBill(b);
            setPaymentMethod(b.paymentMethod || '');
            setPaidAmount(b.paidAmount || 0);
            setTransactionId(b.transactionId || '');

            // Generate QR code
            if (b.billNumber) {
                try {
                    const url = await QRCode.toDataURL(b.billNumber, {
                        width: 100, margin: 1, color: { dark: '#1e293b', light: '#ffffff' }
                    });
                    setQrDataUrl(url);
                } catch { /* ignore QR errors */ }
            }
        } catch {
            toast.error('Failed to load invoice');
        } finally {
            setLoading(false);
        }
    };

    const fetchTemplate = async () => {
        try {
            const res = await invoiceTemplateAPI.get();
            setTemplate(res.data);
        } catch { /* ignore - template is optional enhancement */ }
    };

    // Derived values
    const totalAmount = bill?.totalAmount || 0;
    const currentPaid = Number(paidAmount) || 0;
    const currentDue = Math.max(0, totalAmount - currentPaid);
    const autoStatus = currentPaid <= 0 ? 'Pending' : currentPaid >= totalAmount ? 'Paid' : 'Partial';

    const handlePaymentSave = async () => {
        if (!paymentMethod) {
            toast.error('Please select a payment method');
            return;
        }
        setSavingPayment(true);
        try {
            await billingAPI.updateBill(billId, { paidAmount: currentPaid, paymentMethod, transactionId });
            toast.success('Payment info updated');
            setBill(prev => ({
                ...prev,
                paidAmount: currentPaid,
                dueAmount: currentDue,
                paymentStatus: autoStatus,
                paymentMethod,
                transactionId
            }));
            setPaymentDirty(false);
            if (onUpdated) onUpdated();
        } catch {
            toast.error('Failed to update payment info');
        } finally {
            setSavingPayment(false);
        }
    };

    const isPaymentFilled = bill && autoStatus !== 'Pending' && paymentMethod;

    // Calculate patient age from DOB
    const getPatientAgeStr = (aptData) => {
        const age = aptData?.age;
        const dob = aptData?.dateOfBirth;
        const parts = [];
        if (dob) {
            const d = new Date(dob);
            parts.push(`DOB: ${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`);
        }
        if (age !== undefined && age !== null) {
            parts.push(`Age: ${age}${aptData?.ageMonths ? ` yr ${aptData.ageMonths} mo` : ' yr'}`);
        }
        return parts.join(' | ') || null;
    };

    const handlePrint = () => {
        if (!isPaymentFilled && autoStatus === 'Pending') {
            toast.error('Please update payment information before printing');
            return;
        }
        const printContent = printRef.current;
        const t = template || {};
        const win = window.open('', '_blank');
        win.document.write(`
            <html>
            <head>
                <title>Invoice ${bill?.billNumber}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px 40px; color: #1f2937; font-size: 13px; }
                    .inv-hospital-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 8px; }
                    .inv-hospital-logo { width: 60px; height: 60px; object-fit: contain; border-radius: 6px; }
                    .inv-hospital-info h1 { font-size: 20px; color: #1e293b; margin-bottom: 2px; }
                    .inv-hospital-info p { font-size: 12px; color: #6b7280; margin-bottom: 1px; line-height: 1.5; }
                    .inv-hospital-contacts { display: flex; gap: 16px; margin-top: 4px; font-size: 11px; color: #6b7280; }
                    .inv-divider { height: 3px; background: linear-gradient(90deg, #3b82f6, #8b5cf6); margin: 10px 0 16px; border-radius: 2px; }
                    .invoice-print-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
                    .invoice-print-header h2 { font-size: 22px; color: #3b82f6; }
                    .invoice-print-header .inv-number { text-align: right; }
                    .invoice-print-header .inv-number h3 { font-size: 16px; color: #374151; }
                    .invoice-print-header .inv-number p { color: #6b7280; font-size: 12px; }
                    .invoice-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
                    .detail-block h3 { font-size: 11px; text-transform: uppercase; color: #6b7280; margin-bottom: 6px; letter-spacing: 0.5px; }
                    .detail-block p { font-size: 13px; margin-bottom: 3px; }
                    .detail-block .age-dob { color: #6b7280; font-size: 12px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
                    th { background: #f3f4f6; padding: 8px 12px; text-align: left; font-size: 12px; font-weight: 600; border-bottom: 2px solid #e5e7eb; }
                    td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
                    .text-right { text-align: right; }
                    .totals { width: 280px; margin-left: auto; }
                    .totals .row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; }
                    .totals .row.total { font-size: 16px; font-weight: 700; border-top: 2px solid #1f2937; padding-top: 8px; margin-top: 4px; }
                    .totals .row.paid { color: #059669; }
                    .totals .row.due { color: #dc2626; }
                    .payment-info { margin-top: 16px; padding: 12px 16px; background: #f9fafb; border-radius: 6px; }
                    .payment-info p { font-size: 12px; margin-bottom: 3px; }
                    .inv-bottom-section { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 24px; padding-top: 16px; }
                    .inv-qr-block { text-align: center; }
                    .inv-qr-block img { width: 80px; height: 80px; }
                    .inv-qr-block p { font-size: 10px; color: #9ca3af; margin-top: 3px; }
                    .inv-signature-block { text-align: right; }
                    .inv-signature-block img { max-width: 120px; max-height: 50px; object-fit: contain; margin-bottom: 4px; }
                    .inv-signature-block .sig-line { width: 140px; height: 1px; background: #374151; margin-left: auto; margin-bottom: 4px; }
                    .inv-signature-block p { font-size: 11px; color: #6b7280; }
                    .inv-reg-info { display: flex; gap: 20px; font-size: 11px; color: #9ca3af; margin-top: 16px; }
                    .footer-note { margin-top: 24px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 16px; }
                    .footer-note .terms { font-size: 10px; color: #b0b5be; font-style: italic; margin-top: 6px; }
                    .generated-by { margin-top: 12px; font-size: 11px; color: #6b7280; text-align: right; }
                    .bill-timestamp { margin-top: 6px; font-size: 10px; color: #9ca3af; text-align: right; }
                </style>
            </head>
            <body>${printContent.innerHTML}</body>
            </html>
        `);
        win.document.close();
        win.print();
    };

    const apt = bill?.publicAppointment || appointment;
    const paymentMethods = ['Cash', 'Card', 'UPI', 'Online', 'Insurance'];

    return (
        <div className="billing-modal-overlay" onClick={onClose}>
            <div className="billing-modal view-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2><Eye size={20} /> Invoice</h2>
                    <div className="header-actions">
                        {bill && (
                            <button
                                className={`print-btn ${(!isPaymentFilled && autoStatus === 'Pending') ? 'print-btn-disabled' : ''}`}
                                onClick={handlePrint}
                                title={(!isPaymentFilled && autoStatus === 'Pending') ? 'Update payment info first' : 'Print Invoice'}
                            >
                                <Printer size={16} /> Print
                            </button>
                        )}
                        <button className="close-btn" onClick={onClose}><X size={20} /></button>
                    </div>
                </div>

                <div className="modal-body">
                    {loading ? (
                        <div className="loading-text">Loading invoice...</div>
                    ) : !bill ? (
                        <div className="loading-text">Invoice not found</div>
                    ) : (
                        <>
                            <div className="invoice-content" ref={printRef}>
                                {/* Hospital Header (from template) */}
                                {template && (template.hospitalName || template.hospitalLogoUrl) ? (
                                    <div className="inv-hospital-header">
                                        {template.hospitalLogoUrl && (
                                            <img src={template.hospitalLogoUrl} alt="Logo" className="inv-hospital-logo" />
                                        )}
                                        <div className="inv-hospital-info">
                                            <h1>{template.hospitalName}</h1>
                                            {template.hospitalAddress && <p>{template.hospitalAddress}</p>}
                                            <div className="inv-hospital-contacts">
                                                {template.contactNumber && <span>Tel: {template.contactNumber}</span>}
                                                {template.emailAddress && <span>Email: {template.emailAddress}</span>}
                                                {template.websiteUrl && <span>Web: {template.websiteUrl}</span>}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="inv-hospital-header">
                                        <div className="inv-hospital-info">
                                            <h1>INVOICE</h1>
                                        </div>
                                    </div>
                                )}

                                <div className="inv-divider"></div>

                                <div className="invoice-print-header">
                                    <div>
                                        <h2>INVOICE</h2>
                                    </div>
                                    <div className="inv-number">
                                        <h3>{bill.billNumber}</h3>
                                        <p>Date: {new Date(bill.createdAt).toLocaleDateString('en-IN')}</p>
                                    </div>
                                </div>

                                <div className="invoice-details-grid">
                                    <div className="detail-block">
                                        <h3>Patient Details</h3>
                                        <p><strong>{apt?.fullName}</strong></p>
                                        <p>Patient ID: {apt?.patientId}</p>
                                        {getPatientAgeStr(apt) && (
                                            <p className="age-dob">{getPatientAgeStr(apt)}</p>
                                        )}
                                        <p>Gender: {apt?.gender || 'N/A'}</p>
                                        <p>Mobile: {apt?.mobileNumber || 'N/A'}</p>
                                        <p>Email: {apt?.emailAddress || 'N/A'}</p>
                                    </div>
                                    <div className="detail-block">
                                        <h3>Appointment Details</h3>
                                        <p>ID: {apt?.appointmentId}</p>
                                        <p>Department: {apt?.department || 'N/A'}</p>
                                        <p>Doctor: {apt?.doctorAssigned?.user?.name ? `Dr. ${apt.doctorAssigned.user.name}` : (appointment?.doctorName ? `Dr. ${appointment.doctorName}` : 'N/A')}</p>
                                        <p>Date: {apt?.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString('en-IN') : 'N/A'}</p>
                                        <p>Time: {apt?.appointmentTime || 'N/A'}</p>
                                        {apt?.visitType && <p>Visit: {apt.visitType}</p>}
                                    </div>
                                </div>

                                <table>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Service</th>
                                            <th>Description</th>
                                            <th className="text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bill.services?.map((service, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{service.name}</td>
                                                <td>{service.description || '-'}</td>
                                                <td className="text-right">{RS}{Number(service.amount).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="totals">
                                    <div className="row">
                                        <span>Subtotal:</span>
                                        <span>{RS}{bill.subtotal?.toFixed(2)}</span>
                                    </div>
                                    {bill.discount > 0 && (
                                        <div className="row">
                                            <span>Discount:</span>
                                            <span>- {RS}{bill.discount?.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {(bill.roundOff || 0) !== 0 && (
                                        <div className="row">
                                            <span>Round Off:</span>
                                            <span>{bill.roundOff >= 0 ? '+' : ''} {RS}{bill.roundOff?.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="row total">
                                        <span>Total:</span>
                                        <span>{RS}{bill.totalAmount?.toFixed(2)}</span>
                                    </div>
                                    {currentPaid > 0 && (
                                        <div className="row paid">
                                            <span>Paid:</span>
                                            <span>{RS}{currentPaid.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {autoStatus === 'Partial' && (
                                        <div className="row due">
                                            <span>Due:</span>
                                            <span>{RS}{currentDue.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="payment-info">
                                    <p><strong>Payment Status:</strong> <span className={`pay-status pay-status-${autoStatus.toLowerCase()}`}>{autoStatus}</span></p>
                                    <p><strong>Payment Method:</strong> {paymentMethod || 'N/A'}</p>
                                    {transactionId && <p><strong>Transaction ID:</strong> {transactionId}</p>}
                                </div>

                                {/* QR Code + Signature Row */}
                                <div className="inv-bottom-section">
                                    <div className="inv-qr-block">
                                        {qrDataUrl && <img src={qrDataUrl} alt="QR" />}
                                        <p>{bill.billNumber}</p>
                                    </div>
                                    <div className="inv-signature-block">
                                        {bill.generatedBySignatureUrl && (
                                            <img src={bill.generatedBySignatureUrl} alt="Signature" />
                                        )}
                                        <div className="sig-line"></div>
                                        <p>{bill.generatedBy?.name || 'Authorized Signatory'}</p>
                                        <p>{bill.generatedBy?.role || ''}</p>
                                    </div>
                                </div>

                                {bill.generatedBy?.name && (
                                    <div className="generated-by">
                                        <p>Invoice generated by: <strong>{bill.generatedBy.name}</strong> ({bill.generatedBy.role})</p>
                                    </div>
                                )}
                                <div className="bill-timestamp">
                                    <p>Generated on: {new Date(bill.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                    {bill.updatedAt && bill.updatedAt !== bill.createdAt && (
                                        <p>Last updated: {new Date(bill.updatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                    )}
                                </div>

                                {/* Registration / Compliance Info */}
                                {template && (template.gstNumber || template.cinNumber) && (
                                    <div className="inv-reg-info">
                                        {template.gstNumber && <span>GSTIN: {template.gstNumber}</span>}
                                        {template.cinNumber && <span>CIN: {template.cinNumber}</span>}
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="footer-note">
                                    <p>{template?.footerNote || 'This is a computer-generated invoice.'}</p>
                                    {template?.termsAndConditions && (
                                        <p className="terms">{template.termsAndConditions}</p>
                                    )}
                                </div>
                            </div>

                            {/* Editable Payment Section (outside printRef) */}
                            <div className="view-payment-edit-section">
                                <h3>Update Payment Information</h3>

                                <div className="payment-status-auto">
                                    <label>Payment Status</label>
                                    <span className={`pay-status-badge pay-status-${autoStatus.toLowerCase()}`}>{autoStatus}</span>
                                    <span className="auto-hint">(auto-updates based on paid amount)</span>
                                </div>

                                <div className="payment-method-radio">
                                    <label>Payment Method</label>
                                    <div className="radio-group">
                                        {paymentMethods.map(method => (
                                            <label key={method} className={`radio-option ${paymentMethod === method ? 'selected' : ''}`}>
                                                <input
                                                    type="radio"
                                                    name="viewPaymentMethod"
                                                    value={method}
                                                    checked={paymentMethod === method}
                                                    onChange={e => { setPaymentMethod(e.target.value); setPaymentDirty(true); }}
                                                />
                                                <span>{method}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="payment-amounts-row">
                                    <div className="payment-field">
                                        <label>Paid Amount ({RS})</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={totalAmount}
                                            value={paidAmount}
                                            onChange={e => { setPaidAmount(e.target.value); setPaymentDirty(true); }}
                                        />
                                    </div>
                                    <div className="payment-field">
                                        <label>Due Amount ({RS})</label>
                                        <input type="text" value={`${RS}${currentDue.toFixed(2)}`} readOnly className="readonly-field" />
                                    </div>
                                    <div className="payment-field">
                                        <label>Transaction ID</label>
                                        <input
                                            type="text"
                                            value={transactionId}
                                            onChange={e => { setTransactionId(e.target.value); setPaymentDirty(true); }}
                                            placeholder="Optional"
                                        />
                                    </div>
                                </div>

                                <button
                                    className="btn-primary save-payment-btn"
                                    onClick={handlePaymentSave}
                                    disabled={savingPayment || !paymentDirty}
                                >
                                    {savingPayment ? 'Saving...' : 'Save Payment Info'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ================================================================
   EDIT INVOICE MODAL
   ================================================================ */
const EditInvoiceModal = ({ billId, appointment, onClose, onUpdated }) => {
    const [bill, setBill] = useState(null);
    const [services, setServices] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [roundOff, setRoundOff] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [paidAmount, setPaidAmount] = useState(0);
    const [transactionId, setTransactionId] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchBill();
    }, []);

    const fetchBill = async () => {
        try {
            const res = await billingAPI.getBillById(billId);
            const b = res.data;
            setBill(b);
            setServices(b.services || []);
            setDiscount(b.discount || 0);
            setRoundOff(b.roundOff || 0);
            setPaymentMethod(b.paymentMethod || '');
            setPaidAmount(b.paidAmount || 0);
            setTransactionId(b.transactionId || '');
        } catch {
            toast.error('Failed to load invoice');
        } finally {
            setLoading(false);
        }
    };

    const addService = () => {
        setServices([...services, { name: '', description: '', amount: 0 }]);
    };

    const removeService = (index) => {
        setServices(services.filter((_, i) => i !== index));
    };

    const updateService = (index, field, value) => {
        const updated = [...services];
        updated[index] = { ...updated[index], [field]: field === 'amount' ? Number(value) : value };
        setServices(updated);
    };

    const subtotal = services.reduce((sum, s) => sum + Number(s.amount || 0), 0);
    const total = Math.max(0, subtotal - Number(discount) + Number(roundOff));
    const currentPaid = Number(paidAmount) || 0;
    const currentDue = Math.max(0, total - currentPaid);
    const autoStatus = currentPaid <= 0 ? 'Pending' : currentPaid >= total ? 'Paid' : 'Partial';

    const paymentMethods = ['Cash', 'Card', 'UPI', 'Online', 'Insurance'];

    const handleUpdate = async () => {
        if (services.length === 0) {
            toast.error('Add at least one service');
            return;
        }
        const invalidService = services.find(s => !s.name.trim() || s.amount <= 0);
        if (invalidService) {
            toast.error('All services must have a name and valid amount');
            return;
        }

        setSubmitting(true);
        try {
            await billingAPI.updateBill(billId, {
                services,
                discount: Number(discount),
                roundOff: Number(roundOff),
                paidAmount: currentPaid,
                paymentMethod,
                transactionId
            });
            toast.success('Invoice updated successfully');
            onUpdated();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update invoice');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="billing-modal-overlay" onClick={onClose}>
            <div className="billing-modal edit-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2><Edit2 size={20} /> Edit Invoice {bill?.billNumber && `- ${bill.billNumber}`}</h2>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="modal-body">
                    {loading ? (
                        <div className="loading-text">Loading invoice...</div>
                    ) : (
                        <>
                            {/* Appointment Info */}
                            <div className="appointment-info-card">
                                <div className="info-row">
                                    <span>Patient:</span><strong>{appointment.fullName}</strong>
                                </div>
                                <div className="info-row">
                                    <span>Appointment ID:</span><strong>{appointment.appointmentId}</strong>
                                </div>
                            </div>

                            {/* Services */}
                            <div className="services-section">
                                <div className="section-header">
                                    <h3>Services</h3>
                                    <button className="add-service-btn" onClick={addService}>
                                        <Plus size={14} /> Add Service
                                    </button>
                                </div>

                                {services.map((service, index) => (
                                    <div key={index} className="service-row">
                                        <div className="service-field">
                                            <label>Service Name</label>
                                            <input
                                                type="text"
                                                value={service.name}
                                                onChange={e => updateService(index, 'name', e.target.value)}
                                                placeholder="Service name"
                                            />
                                        </div>
                                        <div className="service-field">
                                            <label>Description</label>
                                            <input
                                                type="text"
                                                value={service.description || ''}
                                                onChange={e => updateService(index, 'description', e.target.value)}
                                                placeholder="Optional"
                                            />
                                        </div>
                                        <div className="service-field amount-field">
                                            <label>Amount ({RS})</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={service.amount}
                                                onChange={e => updateService(index, 'amount', e.target.value)}
                                            />
                                        </div>
                                        <button className="remove-service-btn" onClick={() => removeService(index)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Discount & Round-off */}
                            <div className="adjustments-section">
                                <div className="adjustment-field">
                                    <label>Discount ({RS})</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={discount}
                                        onChange={e => setDiscount(e.target.value)}
                                    />
                                </div>
                                <div className="adjustment-field">
                                    <label>Round Off ({RS})</label>
                                    <input
                                        type="number"
                                        value={roundOff}
                                        onChange={e => setRoundOff(e.target.value)}
                                    />
                                    <span className="hint">Use negative to round down</span>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="payment-section">
                                <h3>Payment Information</h3>

                                <div className="payment-status-auto">
                                    <label>Payment Status</label>
                                    <span className={`pay-status-badge pay-status-${autoStatus.toLowerCase()}`}>{autoStatus}</span>
                                    <span className="auto-hint">(auto-updates based on paid amount)</span>
                                </div>

                                <div className="payment-method-radio">
                                    <label>Payment Method</label>
                                    <div className="radio-group">
                                        {paymentMethods.map(method => (
                                            <label key={method} className={`radio-option ${paymentMethod === method ? 'selected' : ''}`}>
                                                <input
                                                    type="radio"
                                                    name="editPaymentMethod"
                                                    value={method}
                                                    checked={paymentMethod === method}
                                                    onChange={e => setPaymentMethod(e.target.value)}
                                                />
                                                <span>{method}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="payment-amounts-row">
                                    <div className="payment-field">
                                        <label>Paid Amount ({RS})</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={total}
                                            value={paidAmount}
                                            onChange={e => setPaidAmount(e.target.value)}
                                        />
                                    </div>
                                    <div className="payment-field">
                                        <label>Due Amount ({RS})</label>
                                        <input type="text" value={`${RS}${currentDue.toFixed(2)}`} readOnly className="readonly-field" />
                                    </div>
                                    <div className="payment-field">
                                        <label>Transaction ID</label>
                                        <input
                                            type="text"
                                            value={transactionId}
                                            onChange={e => setTransactionId(e.target.value)}
                                            placeholder="Optional"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="bill-summary">
                                <div className="summary-row">
                                    <span>Subtotal:</span>
                                    <span>{RS}{subtotal.toFixed(2)}</span>
                                </div>
                                {Number(discount) > 0 && (
                                    <div className="summary-row discount">
                                        <span>Discount:</span>
                                        <span>- {RS}{Number(discount).toFixed(2)}</span>
                                    </div>
                                )}
                                {Number(roundOff) !== 0 && (
                                    <div className="summary-row">
                                        <span>Round Off:</span>
                                        <span>{Number(roundOff) >= 0 ? '+' : ''} {RS}{Number(roundOff).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="summary-row total">
                                    <span>Total:</span>
                                    <span>{RS}{total.toFixed(2)}</span>
                                </div>
                                {currentPaid > 0 && (
                                    <div className="summary-row paid">
                                        <span>Paid:</span>
                                        <span>{RS}{currentPaid.toFixed(2)}</span>
                                    </div>
                                )}
                                {autoStatus === 'Partial' && (
                                    <div className="summary-row due">
                                        <span>Due:</span>
                                        <span>{RS}{currentDue.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={handleUpdate} disabled={submitting || loading}>
                        {submitting ? 'Updating...' : 'Update Invoice'}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ================================================================
   MAIN BILLING PAGE
   ================================================================ */
const Billing = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchInput, setSearchInput] = useState('');

    // Modal states
    const [generateModal, setGenerateModal] = useState(null);
    const [viewModal, setViewModal] = useState(null);
    const [editModal, setEditModal] = useState(null);
    const [showInsightsModal, setShowInsightsModal] = useState(false);
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        fetchData();
    }, [pagination.page, statusFilter, searchTerm]);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await departmentsAPI.getAll();
            setDepartments(res.departments || res.data || res || []);
        } catch { /* silent */ }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await billingAPI.getAppointmentsBilling({
                page: pagination.page,
                limit: pagination.limit,
                status: statusFilter,
                search: searchTerm
            });
            setData(res.data);
            setPagination(prev => ({ ...prev, ...res.pagination }));
        } catch {
            toast.error('Failed to load billing data');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
        setSearchTerm(searchInput);
    };

    const handleFilterChange = (filter) => {
        setStatusFilter(filter);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const getStatusBadge = (item) => {
        if (!item.bill) {
            return <span className="status-badge status-pending">Pending</span>;
        }
        const status = item.bill.paymentStatus;
        const cls = `status-badge status-${status.toLowerCase()}`;
        return <span className={cls}>{status}</span>;
    };

    const getInvoiceBadge = (item) => {
        if (!item.bill) {
            return <span className="invoice-not-generated">Not Generated</span>;
        }
        return <span className="invoice-number">{item.bill.billNumber}</span>;
    };

    const filters = [
        { key: 'all', label: 'All' },
        { key: 'not-generated', label: 'Not Generated' },
        { key: 'Pending', label: 'Pending' },
        { key: 'Paid', label: 'Paid' },
        { key: 'Due', label: 'Due' },
        { key: 'Partial', label: 'Partial' }
    ];

    return (
        <div className="billing-page">
            {/* Header */}
            <div className="billing-header">
                <div className="billing-title">
                    <h1><IndianRupee size={28} /> Billing & Invoicing</h1>
                    <p>Manage invoices for all appointments</p>
                </div>
                <div className="billing-header-actions">
                    <button className="bil-ins-trigger-btn" onClick={() => setShowInsightsModal(true)}>
                        <BarChart3 size={16} />
                        Insights
                    </button>
                    <button className="refresh-btn" onClick={fetchData} title="Refresh">
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="billing-toolbar">
                <form className="search-form" onSubmit={handleSearch}>
                    <div className="search-input-wrapper">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search by name, appointment ID, patient ID, or invoice #..."
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="search-btn">Search</button>
                </form>
                <div className="filter-buttons">
                    {filters.map(f => (
                        <button
                            key={f.key}
                            className={`filter-btn ${statusFilter === f.key ? 'active' : ''}`}
                            onClick={() => handleFilterChange(f.key)}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="billing-table-container">
                {loading ? (
                    <table className="billing-table">
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Appointment ID</th>
                                <th>Date</th>
                                <th>Department</th>
                                <th>Amount</th>
                                <th>Invoice #</th>
                                <th>Bill Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...Array(7)].map((_, i) => (
                                <tr key={i} className="billing-skeleton-row">
                                    <td>
                                        <div className="billing-skeleton billing-skeleton-text" style={{ width: '110px', marginBottom: '6px' }} />
                                        <div className="billing-skeleton billing-skeleton-text" style={{ width: '70px', height: '10px' }} />
                                    </td>
                                    <td><div className="billing-skeleton billing-skeleton-text" style={{ width: '85px' }} /></td>
                                    <td><div className="billing-skeleton billing-skeleton-text" style={{ width: '80px' }} /></td>
                                    <td><div className="billing-skeleton billing-skeleton-text" style={{ width: '90px' }} /></td>
                                    <td><div className="billing-skeleton billing-skeleton-text" style={{ width: '65px' }} /></td>
                                    <td><div className="billing-skeleton billing-skeleton-text" style={{ width: '90px' }} /></td>
                                    <td><div className="billing-skeleton billing-skeleton-badge" /></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <div className="billing-skeleton billing-skeleton-action" />
                                            <div className="billing-skeleton billing-skeleton-action" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : data.length === 0 ? (
                    <div className="empty-state">No appointments found matching your criteria.</div>
                ) : (
                    <table className="billing-table">
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Appointment ID</th>
                                <th>Date</th>
                                <th>Department</th>
                                <th>Amount</th>
                                <th>Invoice #</th>
                                <th>Bill Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(item => (
                                <tr key={item._id}>
                                    <td>
                                        <div className="patient-cell">
                                            <span className="patient-name">{item.fullName}</span>
                                            <span className="patient-id">{item.patientId}</span>
                                        </div>
                                    </td>
                                    <td><span className="appointment-id">{item.appointmentId}</span></td>
                                    <td>{new Date(item.appointmentDate).toLocaleDateString('en-IN')}</td>
                                    <td>{item.department || '-'}</td>
                                    <td>
                                        {item.bill
                                            ? <span className="amount">{RS}{item.bill.totalAmount?.toFixed(2)}</span>
                                            : <span className="amount-na">{'\u2014'}</span>
                                        }
                                    </td>
                                    <td>{getInvoiceBadge(item)}</td>
                                    <td>{getStatusBadge(item)}</td>
                                    <td>
                                        <div className="action-buttons">
                                            {!item.bill ? (
                                                <button
                                                    className="action-btn action-btn-generate with-label"
                                                    onClick={() => setGenerateModal(item)}
                                                    title={item.appointmentStatus === 'Cancelled' ? 'Cannot generate invoice for cancelled appointment' : 'Generate Invoice'}
                                                    disabled={item.appointmentStatus === 'Cancelled'}
                                                >
                                                    <FileText size={14} /> Generate
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        className="action-btn action-btn-view"
                                                        onClick={() => setViewModal({ billId: item.bill._id, appointment: item })}
                                                        title="View Invoice"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    <button
                                                        className="action-btn action-btn-edit"
                                                        onClick={() => setEditModal({ billId: item.bill._id, appointment: item })}
                                                        title="Edit Invoice"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="billing-pagination">
                    <span className="pagination-info">
                        Showing {((pagination.page - 1) * pagination.limit) + 1}{'\u2013'}{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                    </span>
                    <div className="pagination-buttons">
                        <button
                            disabled={pagination.page <= 1}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        >
                            <ChevronLeft size={16} /> Prev
                        </button>
                        <span className="page-number">Page {pagination.page} of {pagination.pages}</span>
                        <button
                            disabled={pagination.page >= pagination.pages}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            {generateModal && (
                <GenerateInvoiceModal
                    appointment={generateModal}
                    onClose={() => setGenerateModal(null)}
                    onGenerated={() => { setGenerateModal(null); fetchData(); }}
                />
            )}

            {viewModal && (
                <ViewInvoiceModal
                    billId={viewModal.billId}
                    appointment={viewModal.appointment}
                    onClose={() => setViewModal(null)}
                    onUpdated={fetchData}
                />
            )}

            {editModal && (
                <EditInvoiceModal
                    billId={editModal.billId}
                    appointment={editModal.appointment}
                    onClose={() => setEditModal(null)}
                    onUpdated={() => { setEditModal(null); fetchData(); }}
                />
            )}

            {showInsightsModal && (
                <BillingInsightsModal
                    departments={departments}
                    onClose={() => setShowInsightsModal(false)}
                />
            )}
        </div>
    );
};

/* ================================================================
   BILLING INSIGHTS MODAL
   ================================================================ */
const BillingInsightsModal = ({ departments, onClose }) => {
    const [dateRange, setDateRange] = useState('this_month');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [status, setStatus] = useState('');
    const [department, setDepartment] = useState('');
    const [data, setData] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [downloadDone, setDownloadDone] = useState(false);

    const getDateBounds = () => {
        const now = new Date();
        let from, to;
        to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        switch (dateRange) {
            case 'this_month':
                from = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'past_2':
                from = new Date(now.getFullYear(), now.getMonth() - 2, 1);
                break;
            case 'past_3':
                from = new Date(now.getFullYear(), now.getMonth() - 3, 1);
                break;
            case 'past_6':
                from = new Date(now.getFullYear(), now.getMonth() - 6, 1);
                break;
            case 'custom':
                from = customFrom ? new Date(customFrom) : null;
                to = customTo ? new Date(customTo + 'T23:59:59') : to;
                break;
            default:
                from = null;
        }
        return { from, to };
    };

    const fetchInsights = async () => {
        try {
            setLoading(true);
            const { from, to } = getDateBounds();
            const params = {
                dateFrom: from ? from.toISOString() : undefined,
                dateTo: to ? to.toISOString() : undefined,
                department: department || undefined,
                status: status || undefined,
            };
            const res = await billingAPI.getInsights(params);
            setData(res.data || []);
            setAnalytics(res.analytics || null);
        } catch {
            toast.error('Failed to load insights');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInsights();
    }, [dateRange, customFrom, customTo, department, status]);

    const handleClear = () => {
        setDateRange('this_month');
        setCustomFrom('');
        setCustomTo('');
        setStatus('');
        setDepartment('');
    };

    const handleDownload = async () => {
        if (!data.length) {
            toast.error('No invoices to download');
            return;
        }
        try {
            setDownloading(true);
            setDownloadDone(false);

            const headers = ['Invoice #', 'Patient', 'Patient ID', 'Appointment ID', 'Date', 'Department', 'Amount', 'Paid', 'Due', 'Status', 'Payment Method'];
            const rows = data.map(d => [
                d.billNumber || '',
                d.fullName || '',
                d.patientId || '',
                d.appointmentId || '',
                d.appointmentDate ? new Date(d.appointmentDate).toLocaleDateString('en-IN') : '',
                d.department || '',
                d.totalAmount?.toFixed(2) || '0.00',
                d.paidAmount?.toFixed(2) || '0.00',
                d.dueAmount?.toFixed(2) || '0.00',
                d.paymentStatus || '',
                d.paymentMethod || '',
            ]);

            const csvContent = [headers, ...rows]
                .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
                .join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `invoices_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setDownloadDone(true);
            toast.success(`Downloaded ${data.length} invoices`);
            setTimeout(() => {
                setDownloading(false);
                setDownloadDone(false);
            }, 1200);
        } catch {
            toast.error('Download failed');
            setDownloading(false);
        }
    };

    const fmt = (n) => {
        if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
        if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
        return n.toFixed(0);
    };

    return (
        <div className="bil-ins-overlay" onClick={onClose}>
            <div className="bil-ins-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="bil-ins-header">
                    <div className="bil-ins-header-left">
                        <BarChart3 size={20} />
                        <div>
                            <h2>Invoice Insights</h2>
                            <p>Analytics, filters & download</p>
                        </div>
                    </div>
                    <button className="bil-ins-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                {/* Analytics Cards */}
                {analytics && !loading && (
                    <div className="bil-ins-cards">
                        <div className="bil-ins-card bil-ins-card-total">
                            <span className="bil-ins-card-label">Total Invoices</span>
                            <span className="bil-ins-card-value">{analytics.totalInvoices}</span>
                        </div>
                        <div className="bil-ins-card bil-ins-card-revenue">
                            <span className="bil-ins-card-label">Revenue</span>
                            <span className="bil-ins-card-value">{RS}{fmt(analytics.totalRevenue)}</span>
                        </div>
                        <div className="bil-ins-card bil-ins-card-paid">
                            <span className="bil-ins-card-label">Collected</span>
                            <span className="bil-ins-card-value">{RS}{fmt(analytics.totalPaid)}</span>
                        </div>
                        <div className="bil-ins-card bil-ins-card-due">
                            <span className="bil-ins-card-label">Outstanding</span>
                            <span className="bil-ins-card-value">{RS}{fmt(analytics.totalDue)}</span>
                        </div>
                    </div>
                )}

                {/* Status Breakdown Bar */}
                {analytics && !loading && analytics.totalInvoices > 0 && (
                    <div className="bil-ins-status-bar-wrapper">
                        <div className="bil-ins-status-bar">
                            {analytics.statusBreakdown.paid > 0 && (
                                <div className="bil-ins-bar-seg bil-ins-bar-paid" style={{ flex: analytics.statusBreakdown.paid }} title={`Paid: ${analytics.statusBreakdown.paid}`} />
                            )}
                            {analytics.statusBreakdown.pending > 0 && (
                                <div className="bil-ins-bar-seg bil-ins-bar-pending" style={{ flex: analytics.statusBreakdown.pending }} title={`Pending: ${analytics.statusBreakdown.pending}`} />
                            )}
                            {analytics.statusBreakdown.partial > 0 && (
                                <div className="bil-ins-bar-seg bil-ins-bar-partial" style={{ flex: analytics.statusBreakdown.partial }} title={`Partial: ${analytics.statusBreakdown.partial}`} />
                            )}
                            {analytics.statusBreakdown.due > 0 && (
                                <div className="bil-ins-bar-seg bil-ins-bar-due" style={{ flex: analytics.statusBreakdown.due }} title={`Due: ${analytics.statusBreakdown.due}`} />
                            )}
                        </div>
                        <div className="bil-ins-status-legend">
                            {analytics.statusBreakdown.paid > 0 && <span className="bil-ins-legend-item"><span className="bil-ins-dot bil-ins-dot-paid" />{analytics.statusBreakdown.paid} Paid</span>}
                            {analytics.statusBreakdown.pending > 0 && <span className="bil-ins-legend-item"><span className="bil-ins-dot bil-ins-dot-pending" />{analytics.statusBreakdown.pending} Pending</span>}
                            {analytics.statusBreakdown.partial > 0 && <span className="bil-ins-legend-item"><span className="bil-ins-dot bil-ins-dot-partial" />{analytics.statusBreakdown.partial} Partial</span>}
                            {analytics.statusBreakdown.due > 0 && <span className="bil-ins-legend-item"><span className="bil-ins-dot bil-ins-dot-due" />{analytics.statusBreakdown.due} Due</span>}
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bil-ins-body">
                    {/* Date Range */}
                    <div className="bil-ins-section">
                        <label className="bil-ins-label">Date Range</label>
                        <div className="bil-ins-chip-row">
                            {[
                                { key: 'this_month', label: 'This Month' },
                                { key: 'past_2', label: 'Past 2 Months' },
                                { key: 'past_3', label: 'Past 3 Months' },
                                { key: 'past_6', label: 'Past 6 Months' },
                                { key: 'custom', label: 'Custom' },
                            ].map(opt => (
                                <button
                                    key={opt.key}
                                    className={`bil-ins-chip ${dateRange === opt.key ? 'active' : ''}`}
                                    onClick={() => setDateRange(opt.key)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        {dateRange === 'custom' && (
                            <div className="bil-ins-date-range">
                                <div className="bil-ins-date-field">
                                    <label>From</label>
                                    <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} />
                                </div>
                                <span className="bil-ins-date-sep">—</span>
                                <div className="bil-ins-date-field">
                                    <label>To</label>
                                    <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Department */}
                    <div className="bil-ins-section">
                        <label className="bil-ins-label">Department</label>
                        <div className="bil-ins-select-wrapper">
                            <select value={department} onChange={e => setDepartment(e.target.value)}>
                                <option value="">All Departments</option>
                                {departments.map(d => (
                                    <option key={d._id} value={d.name}>{d.name}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="bil-ins-select-icon" />
                        </div>
                    </div>

                    {/* Status */}
                    <div className="bil-ins-section">
                        <label className="bil-ins-label">Payment Status</label>
                        <div className="bil-ins-chip-row">
                            {[
                                { key: '', label: 'All' },
                                { key: 'Paid', label: 'Paid' },
                                { key: 'Pending', label: 'Pending' },
                                { key: 'Partial', label: 'Partial' },
                                { key: 'Due', label: 'Due' },
                            ].map(opt => (
                                <button
                                    key={opt.key}
                                    className={`bil-ins-chip ${status === opt.key ? 'active' : ''}`}
                                    onClick={() => setStatus(opt.key)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Data Preview Table */}
                <div className="bil-ins-table-wrapper">
                    {loading ? (
                        <div className="bil-ins-loading"><Loader2 size={20} className="bil-ins-spin" /> Loading insights...</div>
                    ) : data.length === 0 ? (
                        <div className="bil-ins-empty">No invoices match the selected filters.</div>
                    ) : (
                        <table className="bil-ins-table">
                            <thead>
                                <tr>
                                    <th>Invoice #</th>
                                    <th>Patient</th>
                                    <th>Appt ID</th>
                                    <th>Date</th>
                                    <th>Department</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.slice(0, 50).map((row, i) => (
                                    <tr key={i}>
                                        <td><span className="bil-ins-inv-num">{row.billNumber}</span></td>
                                        <td className="bil-ins-patient">{row.fullName}</td>
                                        <td><span className="bil-ins-appt-id">{row.appointmentId}</span></td>
                                        <td>{row.appointmentDate ? new Date(row.appointmentDate).toLocaleDateString('en-IN') : '-'}</td>
                                        <td>{row.department || '-'}</td>
                                        <td className="bil-ins-amount">{RS}{row.totalAmount?.toFixed(2)}</td>
                                        <td><span className={`bil-ins-badge bil-ins-badge-${row.paymentStatus?.toLowerCase()}`}>{row.paymentStatus}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {data.length > 50 && (
                        <div className="bil-ins-overflow">Showing 50 of {data.length} — download CSV for full data</div>
                    )}
                </div>

                {/* Footer */}
                <div className="bil-ins-footer">
                    <button className="bil-ins-clear-btn" onClick={handleClear}>Clear Filters</button>
                    <button
                        className={`bil-ins-download-btn ${downloading ? (downloadDone ? 'done' : 'loading') : ''}`}
                        onClick={handleDownload}
                        disabled={downloading || loading}
                    >
                        {downloading ? (
                            downloadDone ? (
                                <><CheckCircle size={16} /> Done!</>
                            ) : (
                                <><Loader2 size={16} className="bil-ins-spin" /> Downloading...</>
                            )
                        ) : (
                            <><Download size={16} /> Download CSV</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Billing;
