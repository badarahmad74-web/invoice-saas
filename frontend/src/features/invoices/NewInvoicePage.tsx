import React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { ClientSelect } from './components/ClientSelect';
import { InvoiceItemsForm } from './components/InvoiceItemsForm';
import { InvoicePreview } from './components/InvoicePreview';
import api from '../../lib/axios';
import { ArrowLeft, Save } from 'lucide-react';

const invoiceSchema = z.object({
    clientId: z.string().min(1, 'Client is required'),
    date: z.string(),
    dueDate: z.string(),
    taxRate: z.coerce.number().min(0).max(100),
    currency: z.string().default('USD'),
    notes: z.string().optional(),
    items: z.array(z.object({
        description: z.string().min(1, 'Description required'),
        quantity: z.coerce.number().min(0.01, 'Min 0.01'),
        unitPrice: z.coerce.number().min(0, 'Min 0'),
        productId: z.string().optional(),
    })).min(1, 'Add at least one item'),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export const NewInvoicePage: React.FC = () => {
    const navigate = useNavigate();
    const { register, control, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<InvoiceFormValues>({
        resolver: zodResolver(invoiceSchema) as any,
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            items: [{ description: '', quantity: 1, unitPrice: 0 }],
            taxRate: 0,
            currency: 'USD',
        },
    });

    const formData = watch();

    const onSubmit: SubmitHandler<InvoiceFormValues> = async (data) => {
        try {
            await api.post('/invoices', {
                ...data,
                date: new Date(data.date).toISOString(),
                dueDate: new Date(data.dueDate).toISOString(),
            });
            navigate('/');
        } catch (error: any) {
            console.error('Failed to create invoice', error);
            alert('Failed to save invoice. Please check the form.');
        }
    };

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row overflow-hidden bg-gray-100">
            {/* LEFT: Editor (Scrollable) */}
            <div className="w-full md:w-1/2 lg:w-5/12 overflow-y-auto border-r border-gray-200 bg-white shadow-xl z-10 flex flex-col">
                {/* Toolbar */}
                <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
                    <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-700 flex items-center text-sm font-medium">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back
                    </button>
                    <h2 className="text-lg font-bold text-gray-900">New Invoice</h2>
                    <button
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isSubmitting ? 'Saving...' : 'Save Draft'}
                    </button>
                </div>

                {/* Form Content */}
                <div className="p-6 space-y-8 flex-1">
                    {/* Client Section */}
                    <section className="space-y-4">
                        <ClientSelect
                            value={formData.clientId || ''}
                            onChange={(val) => setValue('clientId', val)}
                            error={errors.clientId?.message}
                        />
                    </section>

                    {/* Dates */}
                    <section className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                            <input
                                type="date"
                                {...register('date')}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                            <input
                                type="date"
                                {...register('dueDate')}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            />
                        </div>
                    </section>

                    {/* Items Section */}
                    <section>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Items</label>
                        <div className="bg-white rounded-lg border border-gray-200 p-1">
                            <InvoiceItemsForm control={control} register={register} errors={errors} />
                        </div>
                        {errors.items?.root && <p className="text-red-500 text-sm mt-1">{errors.items.root.message}</p>}
                    </section>

                    {/* Settings Section */}
                    <section className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                            <input
                                type="number"
                                {...register('taxRate', { valueAsNumber: true })}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                            <select
                                {...register('currency')}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                            </select>
                        </div>
                    </section>

                    <section>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Terms</label>
                        <textarea
                            {...register('notes')}
                            rows={3}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            placeholder="Payment terms, thank you notes, etc."
                        />
                    </section>
                </div>
            </div>

            {/* RIGHT: Live Preview (Scrollable) */}
            <div className="hidden md:block w-1/2 lg:w-7/12 overflow-y-auto bg-gray-100 p-8 flex items-start justify-center">
                <div className="w-full max-w-[210mm] min-h-[297mm] transform scale-95 origin-top">
                    <InvoicePreview data={formData} />
                </div>
            </div>
        </div>
    );
};
