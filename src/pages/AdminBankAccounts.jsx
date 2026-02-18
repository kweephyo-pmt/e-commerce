import { useState, useEffect } from 'react';
import {
    doc, getDoc, setDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
    Banknote, Plus, Edit2, Trash2, Save, X,
    CheckCircle, Star, RefreshCw, AlertCircle, Copy, Check
} from 'lucide-react';
import Toast from '../components/Toast';

// ── Thai bank list for the dropdown ─────────────────────────────────────────
const THAI_BANKS = [
    'Kasikorn Bank (KBank)',
    'Bangkok Bank (BBL)',
    'Siam Commercial Bank (SCB)',
    'Krung Thai Bank (KTB)',
    'Bank of Ayudhya (Krungsri)',
    'TMBThanachart Bank (TTB)',
    'CIMB Thai Bank',
    'UOB Thailand',
    'Kiatnakin Phatra Bank',
    'Land and Houses Bank',
    'Government Savings Bank (GSB)',
    'Government Housing Bank (GHB)',
    'Other',
];

const EMPTY_FORM = {
    bankName: '',
    accountName: '',
    accountNumber: '',
    branch: '',
    promptpay: '',
    note: '',
};

const FIRESTORE_DOC = 'bankAccounts'; // settings/bankAccounts

const AdminBankAccounts = () => {
    const [accounts, setAccounts] = useState([]);   // array of account objects
    const [activeId, setActiveId] = useState(null); // id of the active account
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null); // null = new
    const [form, setForm] = useState(EMPTY_FORM);
    const [formErrors, setFormErrors] = useState({});

    // Copy-to-clipboard
    const [copied, setCopied] = useState('');

    // ── Load from Firestore ──────────────────────────────────────────────────
    const load = async () => {
        setLoading(true);
        try {
            const snap = await getDoc(doc(db, 'settings', FIRESTORE_DOC));
            if (snap.exists()) {
                const data = snap.data();
                setAccounts(data.accounts || []);
                setActiveId(data.activeId || null);
            }
        } catch (e) {
            console.error(e);
            showToast('Failed to load bank accounts', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    // ── Persist to Firestore ─────────────────────────────────────────────────
    const persist = async (newAccounts, newActiveId) => {
        setSaving(true);
        try {
            await setDoc(doc(db, 'settings', FIRESTORE_DOC), {
                accounts: newAccounts,
                activeId: newActiveId,
                updatedAt: serverTimestamp(),
            });
        } catch (e) {
            console.error(e);
            showToast('Failed to save changes', 'error');
        } finally {
            setSaving(false);
        }
    };

    const showToast = (message, type = 'success') => setToast({ message, type });

    // ── Form helpers ─────────────────────────────────────────────────────────
    const openAdd = () => {
        setForm(EMPTY_FORM);
        setFormErrors({});
        setEditingId(null);
        setShowForm(true);
    };

    const openEdit = (acc) => {
        setForm({ ...acc });
        setFormErrors({});
        setEditingId(acc.id);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
        setFormErrors({});
    };

    const validate = () => {
        const errs = {};
        if (!form.bankName.trim()) errs.bankName = 'Bank name is required';
        if (!form.accountName.trim()) errs.accountName = 'Account name is required';
        if (!form.accountNumber.trim()) errs.accountNumber = 'Account number is required';
        setFormErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSaveForm = async () => {
        if (!validate()) return;
        const now = Date.now();
        let newAccounts;
        let newActiveId = activeId;

        if (editingId) {
            // Update existing
            newAccounts = accounts.map(a =>
                a.id === editingId ? { ...a, ...form } : a
            );
        } else {
            // Add new
            const newAcc = { ...form, id: `acc_${now}` };
            newAccounts = [...accounts, newAcc];
            // Auto-set active if first account
            if (newAccounts.length === 1) newActiveId = newAcc.id;
        }

        setAccounts(newAccounts);
        setActiveId(newActiveId);
        await persist(newAccounts, newActiveId);
        showToast(editingId ? 'Account updated!' : 'Account added!');
        closeForm();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this bank account?')) return;
        const newAccounts = accounts.filter(a => a.id !== id);
        const newActiveId = activeId === id
            ? (newAccounts[0]?.id || null)
            : activeId;
        setAccounts(newAccounts);
        setActiveId(newActiveId);
        await persist(newAccounts, newActiveId);
        showToast('Account deleted');
    };

    const handleSetActive = async (id) => {
        setActiveId(id);
        await persist(accounts, id);
        showToast('Active account updated!');
    };

    const copyText = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(''), 2000);
    };

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <>
            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}

            <div className="space-y-4 md:space-y-6">

                {/* ── Header — hidden on mobile (shown in AdminDashboard top bar) */}
                <div className="hidden md:block bg-gray-900 corner-clip p-8 border-2 border-cyan-500/30 relative overflow-hidden"
                    style={{ boxShadow: '0 0 40px rgba(0,255,255,0.2)' }}>
                    <div className="absolute inset-0 opacity-5"
                        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.1) 2px, rgba(0,255,255,0.1) 4px)' }} />
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent" />
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 corner-clip flex items-center justify-center"
                                style={{ boxShadow: '0 0 25px rgba(0,255,255,0.6)' }}>
                                <Banknote className="w-8 h-8 text-white" style={{ filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.8))' }} />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-white uppercase tracking-wider mb-1"
                                    style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(0,255,255,0.8)' }}>
                                    Bank Accounts
                                </h1>
                                <p className="text-cyan-300/70 text-lg font-bold uppercase tracking-wide"
                                    style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                    Manage payment accounts shown to customers at checkout
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={load} disabled={loading}
                                className="inline-flex items-center space-x-2 px-5 py-3 bg-gray-800 hover:bg-gray-700 text-cyan-300 font-black uppercase tracking-wide corner-clip-sm border-2 border-cyan-500/40 hover:border-cyan-400 transition-all disabled:opacity-50"
                                style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 12px rgba(0,255,255,0.2)' }}>
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                <span>Refresh</span>
                            </button>
                            <button onClick={openAdd}
                                className="inline-flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black uppercase tracking-wide corner-clip-sm border-2 border-cyan-400/60 hover:from-cyan-400 hover:to-blue-500 transition-all"
                                style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 20px rgba(0,255,255,0.4)' }}>
                                <Plus className="w-4 h-4" />
                                <span>Add Account</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Mobile action bar (hidden on desktop) */}
                <div className="flex md:hidden items-center gap-3">
                    <button onClick={load} disabled={loading}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 text-cyan-300 font-black uppercase tracking-wide corner-clip-sm border-2 border-cyan-500/40 hover:border-cyan-400 transition-all disabled:opacity-50 text-sm"
                        style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                    <button onClick={openAdd}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black uppercase tracking-wide corner-clip-sm border-2 border-cyan-400/60 hover:from-cyan-400 hover:to-blue-500 transition-all text-sm"
                        style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 15px rgba(0,255,255,0.3)' }}>
                        <Plus className="w-4 h-4" />
                        <span>Add Account</span>
                    </button>
                </div>

                {/* ── Active account info banner ──────────────────────────── */}
                {!loading && accounts.length > 0 && (
                    <div className="bg-cyan-500/10 border-2 border-cyan-500/40 corner-clip-sm p-4 flex items-center gap-3"
                        style={{ boxShadow: '0 0 15px rgba(0,255,255,0.1)' }}>
                        <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                        <p className="text-cyan-300 font-bold text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            The <span className="text-white font-black">active account</span> is displayed to customers on the checkout page.
                            Click <span className="text-cyan-400 font-black">Set Active</span> on any account to switch.
                        </p>
                    </div>
                )}

                {/* ── Loading ─────────────────────────────────────────────── */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="relative w-16 h-16 mx-auto mb-4">
                            <div className="absolute inset-0 border-4 border-cyan-500/30 corner-clip animate-spin"
                                style={{ borderTopColor: 'rgba(0,255,255,0.9)', boxShadow: '0 0 20px rgba(0,255,255,0.5)' }} />
                        </div>
                        <p className="text-cyan-400 uppercase tracking-widest font-black" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            Loading accounts...
                        </p>
                    </div>
                ) : accounts.length === 0 ? (
                    /* ── Empty state ─────────────────────────────────────── */
                    <div className="bg-gray-900 corner-clip border-2 border-cyan-500/20 p-16 text-center"
                        style={{ boxShadow: '0 0 30px rgba(0,255,255,0.1)' }}>
                        <div className="w-20 h-20 bg-cyan-500/10 corner-clip mx-auto mb-6 flex items-center justify-center border-2 border-cyan-500/30">
                            <Banknote className="w-10 h-10 text-cyan-400/50" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-400 uppercase tracking-wide mb-2"
                            style={{ fontFamily: 'Orbitron, sans-serif' }}>No Bank Accounts</h3>
                        <p className="text-gray-500 font-bold mb-6" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            Add your first bank account to start accepting bank transfer payments.
                        </p>
                        <button onClick={openAdd}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black uppercase tracking-wide corner-clip-sm border-2 border-cyan-400/60 hover:from-cyan-400 hover:to-blue-500 transition-all"
                            style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 20px rgba(0,255,255,0.4)' }}>
                            <Plus className="w-5 h-5" /> Add First Account
                        </button>
                    </div>
                ) : (
                    /* ── Account cards grid ──────────────────────────────── */
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {accounts.map((acc) => {
                            const isActive = acc.id === activeId;
                            return (
                                <div key={acc.id}
                                    className={`bg-gray-900 corner-clip border-2 relative overflow-hidden transition-all duration-300 ${isActive
                                        ? 'border-cyan-500/70 shadow-[0_0_30px_rgba(0,255,255,0.25)]'
                                        : 'border-gray-700/50 hover:border-cyan-500/30'}`}>

                                    {/* Active badge */}
                                    {isActive && (
                                        <div className="absolute top-0 right-0 bg-gradient-to-l from-cyan-500 to-blue-600 px-3 py-1 flex items-center gap-1.5"
                                            style={{ clipPath: 'polygon(8px 0, 100% 0, 100% 100%, 0 100%)' }}>
                                            <Star className="w-3 h-3 text-white fill-white" />
                                            <span className="text-white text-xs font-black uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Active</span>
                                        </div>
                                    )}

                                    {/* Card header */}
                                    <div className={`px-5 pt-5 pb-4 border-b ${isActive ? 'border-cyan-500/20' : 'border-gray-700/30'}`}>
                                        <div className="flex items-center gap-3 pr-16">
                                            <div className={`w-10 h-10 corner-clip-sm flex items-center justify-center flex-shrink-0 border-2 ${isActive ? 'bg-cyan-500/20 border-cyan-500/50' : 'bg-gray-800 border-gray-600/50'}`}>
                                                <Banknote className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-gray-400'}`} />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className={`font-black text-base uppercase tracking-wide truncate ${isActive ? 'text-cyan-400' : 'text-white'}`}
                                                    style={{ fontFamily: 'Rajdhani, sans-serif', textShadow: isActive ? '0 0 10px rgba(0,255,255,0.5)' : 'none' }}>
                                                    {acc.bankName}
                                                </h3>
                                                <p className="text-gray-400 text-sm font-bold truncate" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                    {acc.accountName}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Account details */}
                                    <div className="px-5 py-4 space-y-2.5">
                                        {[
                                            { label: 'Account No.', value: acc.accountNumber, key: `${acc.id}-acc`, mono: true },
                                            acc.branch && { label: 'Branch', value: acc.branch, key: `${acc.id}-br`, mono: false },
                                            acc.promptpay && { label: 'PromptPay', value: acc.promptpay, key: `${acc.id}-pp`, mono: true },
                                            acc.note && { label: 'Note', value: acc.note, key: `${acc.id}-note`, mono: false },
                                        ].filter(Boolean).map(({ label, value, key, mono }) => (
                                            <div key={key} className="flex items-center justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{label}</p>
                                                    <p className={`text-white font-black text-sm truncate ${mono ? '' : ''}`}
                                                        style={{ fontFamily: mono ? 'Orbitron, sans-serif' : 'Rajdhani, sans-serif', fontSize: mono ? '0.8rem' : undefined }}>
                                                        {value}
                                                    </p>
                                                </div>
                                                <button onClick={() => copyText(value, key)}
                                                    className="flex-shrink-0 text-cyan-400/60 hover:text-cyan-400 transition-colors p-1 hover:bg-cyan-500/10 corner-clip-sm"
                                                    title="Copy">
                                                    {copied === key ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <div className={`px-5 py-3 border-t flex items-center gap-2 ${isActive ? 'border-cyan-500/20 bg-cyan-500/5' : 'border-gray-700/30 bg-gray-800/30'}`}>
                                        {!isActive && (
                                            <button onClick={() => handleSetActive(acc.id)}
                                                disabled={saving}
                                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400 corner-clip-sm font-black text-xs uppercase tracking-wide transition-all disabled:opacity-50"
                                                style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 8px rgba(0,255,255,0.15)' }}>
                                                <Star className="w-3.5 h-3.5" /> Set Active
                                            </button>
                                        )}
                                        {isActive && (
                                            <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400/60 corner-clip-sm font-black text-xs uppercase tracking-wide"
                                                style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                <CheckCircle className="w-3.5 h-3.5" /> Currently Active
                                            </div>
                                        )}
                                        <button onClick={() => openEdit(acc)}
                                            className="flex items-center gap-1.5 px-3 py-2 bg-gray-700/50 border border-gray-600/50 text-gray-300 hover:bg-gray-700 hover:border-gray-500 corner-clip-sm font-black text-xs uppercase tracking-wide transition-all"
                                            style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                            <Edit2 className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        <button onClick={() => handleDelete(acc.id)}
                                            disabled={saving}
                                            className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 border border-red-500/40 text-red-400 hover:bg-red-500/20 hover:border-red-400 corner-clip-sm font-black text-xs uppercase tracking-wide transition-all disabled:opacity-50"
                                            style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 8px rgba(255,0,0,0.1)' }}>
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── Add / Edit Form Modal ───────────────────────────────── */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={closeForm}>
                        <div className="w-full max-w-lg bg-gray-900 corner-clip border-2 border-cyan-500/50 relative overflow-hidden"
                            style={{ boxShadow: '0 0 60px rgba(0,255,255,0.3)' }}
                            onClick={e => e.stopPropagation()}>

                            {/* Scanline overlay */}
                            <div className="absolute inset-0 opacity-5 pointer-events-none"
                                style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.1) 2px, rgba(0,255,255,0.1) 4px)' }} />

                            {/* Modal header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b-2 border-cyan-500/20 bg-gray-800/60 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 corner-clip-sm flex items-center justify-center"
                                        style={{ boxShadow: '0 0 15px rgba(0,255,255,0.5)' }}>
                                        <Banknote className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-xl font-black text-cyan-400 uppercase tracking-wide"
                                        style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 10px rgba(0,255,255,0.6)' }}>
                                        {editingId ? 'Edit Account' : 'Add Bank Account'}
                                    </h2>
                                </div>
                                <button onClick={closeForm}
                                    className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 corner-clip-sm">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Form body */}
                            <div className="px-6 py-6 space-y-4 relative z-10 max-h-[70vh] overflow-y-auto">

                                {/* Bank Name dropdown */}
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5"
                                        style={{ fontFamily: 'Rajdhani, sans-serif' }}>Bank Name *</label>
                                    <select
                                        value={form.bankName}
                                        onChange={e => setForm({ ...form, bankName: e.target.value })}
                                        className={`w-full bg-gray-800 border-2 corner-clip-sm text-white px-4 py-2.5 focus:outline-none transition-all font-bold text-sm ${formErrors.bankName ? 'border-red-500' : 'border-cyan-500/30 focus:border-cyan-400'}`}
                                        style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                        <option value="">— Select bank —</option>
                                        {THAI_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                    {formErrors.bankName && <p className="mt-1 text-xs text-red-400 font-bold">{formErrors.bankName}</p>}
                                </div>

                                {/* Account Name */}
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5"
                                        style={{ fontFamily: 'Rajdhani, sans-serif' }}>Account Name *</label>
                                    <input type="text" value={form.accountName}
                                        onChange={e => setForm({ ...form, accountName: e.target.value })}
                                        placeholder="e.g. Phyo Min Thein"
                                        className={`w-full bg-gray-800 border-2 corner-clip-sm text-white px-4 py-2.5 focus:outline-none transition-all font-bold text-sm placeholder-gray-600 ${formErrors.accountName ? 'border-red-500' : 'border-cyan-500/30 focus:border-cyan-400'}`}
                                        style={{ fontFamily: 'Rajdhani, sans-serif' }} />
                                    {formErrors.accountName && <p className="mt-1 text-xs text-red-400 font-bold">{formErrors.accountName}</p>}
                                </div>

                                {/* Account Number */}
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5"
                                        style={{ fontFamily: 'Rajdhani, sans-serif' }}>Account Number *</label>
                                    <input type="text" value={form.accountNumber}
                                        onChange={e => setForm({ ...form, accountNumber: e.target.value })}
                                        placeholder="e.g. 123-4-56789-0"
                                        className={`w-full bg-gray-800 border-2 corner-clip-sm text-white px-4 py-2.5 focus:outline-none transition-all font-black text-sm placeholder-gray-600 ${formErrors.accountNumber ? 'border-red-500' : 'border-cyan-500/30 focus:border-cyan-400'}`}
                                        style={{ fontFamily: 'Orbitron, sans-serif' }} />
                                    {formErrors.accountNumber && <p className="mt-1 text-xs text-red-400 font-bold">{formErrors.accountNumber}</p>}
                                </div>

                                {/* Branch (optional) */}
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5"
                                        style={{ fontFamily: 'Rajdhani, sans-serif' }}>Branch <span className="text-gray-600 normal-case">(optional)</span></label>
                                    <input type="text" value={form.branch}
                                        onChange={e => setForm({ ...form, branch: e.target.value })}
                                        placeholder="e.g. Central World Branch"
                                        className="w-full bg-gray-800 border-2 border-cyan-500/30 corner-clip-sm text-white px-4 py-2.5 focus:outline-none focus:border-cyan-400 transition-all font-bold text-sm placeholder-gray-600"
                                        style={{ fontFamily: 'Rajdhani, sans-serif' }} />
                                </div>

                                {/* PromptPay (optional) */}
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5"
                                        style={{ fontFamily: 'Rajdhani, sans-serif' }}>PromptPay Number <span className="text-gray-600 normal-case">(optional)</span></label>
                                    <input type="text" value={form.promptpay}
                                        onChange={e => setForm({ ...form, promptpay: e.target.value })}
                                        placeholder="e.g. 0812345678"
                                        className="w-full bg-gray-800 border-2 border-cyan-500/30 corner-clip-sm text-white px-4 py-2.5 focus:outline-none focus:border-cyan-400 transition-all font-black text-sm placeholder-gray-600"
                                        style={{ fontFamily: 'Orbitron, sans-serif' }} />
                                </div>

                                {/* Note (optional) */}
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5"
                                        style={{ fontFamily: 'Rajdhani, sans-serif' }}>Internal Note <span className="text-gray-600 normal-case">(optional)</span></label>
                                    <textarea value={form.note}
                                        onChange={e => setForm({ ...form, note: e.target.value })}
                                        placeholder="e.g. Main business account"
                                        rows={2}
                                        className="w-full bg-gray-800 border-2 border-cyan-500/30 corner-clip-sm text-white px-4 py-2.5 focus:outline-none focus:border-cyan-400 transition-all font-bold text-sm placeholder-gray-600 resize-none"
                                        style={{ fontFamily: 'Rajdhani, sans-serif' }} />
                                </div>

                                {/* Warning if no accounts yet */}
                                {accounts.length === 0 && !editingId && (
                                    <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/30 corner-clip-sm p-3">
                                        <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-yellow-300 text-xs font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                            This will be automatically set as the active account.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Modal footer */}
                            <div className="px-6 py-4 border-t-2 border-cyan-500/20 bg-gray-800/40 flex justify-end gap-3 relative z-10">
                                <button onClick={closeForm}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 border-2 border-gray-600 text-gray-300 hover:bg-gray-600 corner-clip-sm font-black text-sm uppercase tracking-wide transition-all"
                                    style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                    <X className="w-4 h-4" /> Cancel
                                </button>
                                <button onClick={handleSaveForm} disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 corner-clip-sm font-black text-sm uppercase tracking-wide transition-all border-2 border-cyan-400/60 disabled:opacity-50"
                                    style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 20px rgba(0,255,255,0.4)' }}>
                                    <Save className="w-4 h-4" />
                                    {saving ? 'Saving...' : editingId ? 'Update Account' : 'Add Account'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default AdminBankAccounts;
