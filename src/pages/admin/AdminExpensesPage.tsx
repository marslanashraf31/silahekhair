import React, { useState, useEffect } from 'react';
import { TrendingDown, Plus, CheckCircle2, AlertCircle, X, RefreshCw, Trash2, Loader2, FileText, Check, Layers, Tag } from 'lucide-react';
import { ExpenseRecord, DATASTORE_CHANGE_EVENT, getExpenses, saveExpenses, addExpenseRecord, deleteExpenseRecord, getEvents } from '../../utils/dataStore';
import { dbGetExpenses } from '../../lib/supabaseService';
import { EventItem, SubExpenseItem } from '../../types';

export const AdminExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [eventsList, setEventsList] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [category, setCategory] = useState('Ration Support');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiptAvailable, setReceiptAvailable] = useState(true);
  const [notes, setNotes] = useState('');
  
  // Event & Itemized Expenses
  const [selectedEventId, setSelectedEventId] = useState('');
  const [customEventName, setCustomEventName] = useState('');
  const [subItems, setSubItems] = useState<Array<{ id: string; name: string; amount: string }>>([
    { id: '1', name: '', amount: '' }
  ]);

  // Status & Feedback State
  const [isSaving, setIsSaving] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchExpensesFromSupabase = async () => {
    setLoading(true);
    try {
      const remote = await dbGetExpenses();
      const current = remote.filter(e => e.status !== 'Archived');
      setExpenses(current);
      saveExpenses(current);
      setEventsList(getEvents());
    } catch (err: any) {
      console.warn('Error fetching expenses from Supabase:', err);
      setExpenses(getExpenses());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpensesFromSupabase();
    window.addEventListener(DATASTORE_CHANGE_EVENT, fetchExpensesFromSupabase);
    return () => window.removeEventListener(DATASTORE_CHANGE_EVENT, fetchExpensesFromSupabase);
  }, []);

  const handleAddSubItem = () => {
    setSubItems([...subItems, { id: String(Date.now()), name: '', amount: '' }]);
  };

  const handleRemoveSubItem = (id: string) => {
    if (subItems.length > 1) {
      const updated = subItems.filter(item => item.id !== id);
      setSubItems(updated);
      recalculateTotalFromSubItems(updated);
    }
  };

  const handleSubItemChange = (id: string, field: 'name' | 'amount', value: string) => {
    const updated = subItems.map(item => item.id === id ? { ...item, [field]: value } : item);
    setSubItems(updated);
    if (field === 'amount') {
      recalculateTotalFromSubItems(updated);
    }
  };

  const recalculateTotalFromSubItems = (items: Array<{ id: string; name: string; amount: string }>) => {
    const total = items.reduce((sum, item) => {
      const val = parseFloat(item.amount);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
    if (total > 0) {
      setAmount(String(total));
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessNotice(null);
    setErrorMessage(null);

    const numAmount = Number(amount);
    if (!description.trim()) {
      setErrorMessage('Please enter an expense description/purpose.');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Please enter a valid expense amount greater than 0.');
      return;
    }
    if (!date) {
      setErrorMessage('Please select a disbursement date.');
      return;
    }

    // Process sub-items
    const validItems: SubExpenseItem[] = subItems
      .filter(i => i.name.trim().length > 0)
      .map(i => ({
        name: i.name.trim(),
        amount: Number(i.amount) || 0
      }));

    let finalEventId: string | undefined = undefined;
    let finalEventName: string | undefined = undefined;

    if (selectedEventId && selectedEventId !== 'custom') {
      const ev = eventsList.find(e => e.id === selectedEventId);
      finalEventId = selectedEventId;
      finalEventName = ev ? ev.title : selectedEventId;
    } else if (customEventName.trim()) {
      finalEventName = customEventName.trim();
    }

    const finalCategory = (category === 'Other' || category === 'Custom') && customCategory.trim() ? customCategory.trim() : category;

    setIsSaving(true);
    try {
      const result = await addExpenseRecord({
        category: finalCategory,
        description: description.trim(),
        amount: numAmount,
        date,
        eventId: finalEventId,
        eventName: finalEventName,
        items: validItems.length > 0 ? validItems : undefined,
        receiptAvailable,
        status: 'Confirmed',
        notes: notes.trim() || undefined
      });

      if (result.success && result.data) {
        setSuccessNotice('Expense recorded successfully.');
        await fetchExpensesFromSupabase();

        // Reset Form & Close Modal
        setTimeout(() => {
          setShowAddModal(false);
          setDescription('');
          setAmount('');
          setNotes('');
          setSelectedEventId('');
          setCustomEventName('');
          setSubItems([{ id: '1', name: '', amount: '' }]);
          setSuccessNotice(null);
        }, 1200);
      } else {
        setErrorMessage(result.error || 'Failed to record expense.');
      }
    } catch (err: any) {
      console.error('Exception in expense creation:', err);
      setErrorMessage(err?.message || 'An unexpected error occurred while saving the expense.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) {
      return;
    }
    setDeletingId(id);
    setErrorMessage(null);
    setSuccessNotice(null);

    try {
      const res = await deleteExpenseRecord(id);
      if (res.success) {
        setSuccessNotice('Expense record deleted.');
        await fetchExpensesFromSupabase();
        setTimeout(() => setSuccessNotice(null), 3000);
      } else {
        setErrorMessage(res.error || 'Failed to delete expense record.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to delete expense.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Notifications / Banners */}
      {successNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#064E3B]">
            Expense & Disbursement Ledger
          </h2>
          <p className="font-sans text-xs sm:text-sm text-slate-500 mt-1">
            Track direct ration purchases, medical aid disbursements, and operational costs backed by Supabase database.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchExpensesFromSupabase}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh expenses from Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => {
              setErrorMessage(null);
              setSuccessNotice(null);
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#047857] text-white font-sans font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense Entry</span>
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Code / ID</th>
                <th className="py-3.5 px-4 sm:px-6">Disbursement Date</th>
                <th className="py-3.5 px-4 sm:px-6">Category</th>
                <th className="py-3.5 px-4 sm:px-6">Description / Purpose</th>
                <th className="py-3.5 px-4 sm:px-6">Amount (PKR)</th>
                <th className="py-3.5 px-4 sm:px-6">Receipt / Voucher</th>
                <th className="py-3.5 px-4 sm:px-6">Approval Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-sans">
              {loading && expenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="w-5 h-5 text-[#064E3B] animate-spin" />
                      <span>Loading expenses from Supabase database...</span>
                    </div>
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center mx-auto border border-rose-100">
                        <TrendingDown className="w-6 h-6" />
                      </div>
                      <p className="font-serif font-bold text-slate-800 text-base">
                        No Expense Logs Registered
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed font-sans">
                        No expenses found in Supabase database. Click "Add Expense Entry" above to record a new transaction.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-slate-700">
                      {exp.id}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-600 font-medium">
                      {exp.date}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-[#064E3B] border border-emerald-100">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-800 max-w-xs truncate font-medium">
                      {exp.description}
                      {exp.notes && (
                        <p className="text-[10px] text-slate-400 truncate">{exp.notes}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-rose-700">
                      PKR {exp.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6">
                      {exp.receiptAvailable ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                          <Check className="w-3.5 h-3.5" />
                          <span>Verified Receipt</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Pending Voucher</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{exp.status || 'Confirmed'}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        disabled={deletingId === exp.id}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                        title="Delete expense"
                      >
                        {deletingId === exp.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-serif text-lg font-bold text-[#064E3B]">
                New Expense Record
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                disabled={isSaving}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Database Info */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p>
                Connected to live Supabase database. Recorded expenses permanently update the foundation ledger and treasury.
              </p>
            </div>

            {/* Modal Alerts */}
            {isSaving && (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                <span>Saving expense...</span>
              </div>
            )}

            {successNotice && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successNotice}</span>
              </div>
            )}

            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form className="space-y-4 max-h-[70vh] overflow-y-auto pr-1" onSubmit={handleCreateExpense}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={isSaving}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-[#064E3B] focus:outline-hidden"
                  >
                    <option>Ration Support</option>
                    <option>Food Distribution</option>
                    <option>Medical Relief</option>
                    <option>Education Support</option>
                    <option>Operations</option>
                    <option value="Other">Other / Custom...</option>
                  </select>
                  {(category === 'Other' || category === 'Custom') && (
                    <input
                      type="text"
                      required
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Enter custom category name..."
                      className="mt-2 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-[#064E3B] focus:outline-hidden"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Associated Event (Optional)
                  </label>
                  <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    disabled={isSaving}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-[#064E3B] focus:outline-hidden"
                  >
                    <option value="">-- No Specific Event --</option>
                    {eventsList.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} ({ev.date})
                      </option>
                    ))}
                    <option value="custom">+ Add Custom Event Name</option>
                  </select>
                </div>
              </div>

              {selectedEventId === 'custom' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Custom Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={customEventName}
                    onChange={(e) => setCustomEventName(e.target.value)}
                    disabled={isSaving}
                    placeholder="e.g. Annual Ramzan Ration Distribution Drive"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-[#064E3B] focus:outline-hidden"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Main Expense Description / Title *
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSaving}
                  placeholder="e.g. Ration & Meal Distribution Expenses"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-[#064E3B] focus:outline-hidden"
                />
              </div>

              {/* Itemized Expenses Breakdown Builder (Unlimited!) */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#064E3B] uppercase flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#047857]" />
                    <span>Itemized Breakdown (Rickshaw, Deg, Packing, etc.)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSubItem}
                    className="text-[11px] text-[#047857] hover:text-[#064E3B] font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {subItems.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`Item ${index + 1} Name (e.g. Rickshaw fare, Deg price)`}
                        value={item.name}
                        onChange={(e) => handleSubItemChange(item.id, 'name', e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#047857]"
                      />
                      <input
                        type="number"
                        placeholder="Amount (PKR)"
                        value={item.amount}
                        onChange={(e) => handleSubItemChange(item.id, 'amount', e.target.value)}
                        className="w-28 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#047857]"
                      />
                      {subItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSubItem(item.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Total Amount (PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isSaving}
                    placeholder="e.g. 15000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#064E3B] focus:bg-white focus:border-[#064E3B] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Disbursement Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    disabled={isSaving}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-[#064E3B] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Notes / Voucher References
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isSaving}
                  placeholder="Optional reference notes or receipt voucher details"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-[#064E3B] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="receiptAvailable"
                  checked={receiptAvailable}
                  onChange={(e) => setReceiptAvailable(e.target.checked)}
                  disabled={isSaving}
                  className="rounded border-slate-300 text-[#064E3B] focus:ring-[#064E3B]"
                />
                <label htmlFor="receiptAvailable" className="text-xs text-slate-700 font-medium cursor-pointer">
                  Vendor receipt or disbursement voucher verified
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSaving}
                  className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-200 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#064E3B] text-white text-xs font-bold rounded-xl hover:bg-[#047857] cursor-pointer disabled:opacity-50 transition-colors"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving expense...</span>
                    </>
                  ) : (
                    <span>Save Record</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
