import React from 'react';
import type { Control, UseFormRegister } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';
import { Trash2, Plus } from 'lucide-react';

interface InvoiceItemFormProps {
    control: Control<any>;
    register: UseFormRegister<any>;
    errors: any;
}

export const InvoiceItemsForm: React.FC<InvoiceItemFormProps> = ({ control, register, errors }) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items',
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Items</h3>
                <button
                    type="button"
                    onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
                    className="flex items-center text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                </button>
            </div>

            <div className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-4 items-start bg-gray-50 p-3 rounded-lg group">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                            <input
                                {...register(`items.${index}.description`)}
                                placeholder="Item description"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            />
                            {errors.items?.[index]?.description && (
                                <p className="text-xs text-red-600 mt-1">{errors.items[index].description.message}</p>
                            )}
                        </div>

                        <div className="w-20">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Qty</label>
                            <input
                                {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                                type="number"
                                step="0.1"
                                min="0"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            />
                        </div>

                        <div className="w-28">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Price</label>
                            <input
                                {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                                type="number"
                                step="0.01"
                                min="0"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-right"
                            />
                        </div>

                        <div className="pt-6">
                            <button
                                type="button"
                                onClick={() => remove(index)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {fields.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-gray-500 text-sm">No items added yet.</p>
                        <button
                            type="button"
                            onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
                            className="mt-2 text-indigo-600 text-sm font-medium hover:underline"
                        >
                            Add your first item
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
