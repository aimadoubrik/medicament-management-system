import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { Controller, DefaultValues, FieldValues, Path, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

// Define field types the form can handle
export type FieldType = 'text' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date' | 'email' | 'password' | 'tel' | 'url';

// Define structure for select options
interface SelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
}

// Define form section for organizing fields
interface FormSection<TFormValues extends FieldValues> {
    title?: string;
    description?: string;
    fields: FieldConfig<TFormValues>[];
}

// Define configuration for a single field, with enhanced options
export interface FieldConfig<TFormValues extends FieldValues> {
    name: Path<TFormValues>;
    label: string;
    type: FieldType;
    placeholder?: string;
    description?: string; // Help text for the field
    options?: SelectOption[]; // For 'select' type
    required?: boolean;
    disabled?: boolean;
    hidden?: boolean;
    className?: string;
    labelClassName?: string;
    inputClassName?: string;
    rows?: number; // For textarea
    min?: number; // For number inputs
    max?: number; // For number inputs
    step?: number; // For number inputs
    pattern?: string; // For text-based inputs
    autoFocus?: boolean;
    dependsOn?: {
        field: Path<TFormValues>;
        value: unknown;
        condition?: 'equals' | 'notEquals' | 'contains' | 'notContains';
    };
}

// Props for the form component with enhanced options
interface ResourceFormProps<TFormValues extends FieldValues> {
    schema: z.ZodType<TFormValues>;
    fieldConfig: FieldConfig<TFormValues>[] | FormSection<TFormValues>[];
    initialData?: Partial<TFormValues> | null;
    onSubmit: SubmitHandler<TFormValues>;
    onCancel?: () => void;
    isLoading?: boolean;
    submitButtonText?: string;
    cancelButtonText?: string;
    formId?: string;
    className?: string;
    title?: string;
    description?: string;
    showProgressIndicator?: boolean;
    layout?: 'vertical' | 'horizontal' | 'grid';
    gridColumns?: number;
    compact?: boolean;
}

export function ResourceForm<TFormValues extends FieldValues>({
    schema,
    fieldConfig,
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    submitButtonText = 'Submit',
    cancelButtonText = 'Cancel',
    formId,
    className,
    title,
    description,
    showProgressIndicator = false,
    layout = 'vertical',
    gridColumns = 2,
    compact = false,
}: ResourceFormProps<TFormValues>) {
    // Track first error field for focus management
    const firstErrorRef = useRef<string | null>(null);

    // Check if fieldConfig is an array of sections or fields
    const hasSections = useMemo(() => {
        return fieldConfig.length > 0 && 'fields' in fieldConfig[0];
    }, [fieldConfig]);

    // Flatten fields if using sections
    const flattenedFields = useMemo(() => {
        if (hasSections) {
            return (fieldConfig as FormSection<TFormValues>[]).flatMap((section) => section.fields);
        }
        return fieldConfig as FieldConfig<TFormValues>[];
    }, [fieldConfig, hasSections]);

    // Prepare default values based on the schema/fields for 'create' mode
    const defaultFormValues = useMemo(() => {
        try {
            // Use Zod's safeParse which doesn't throw on error.
            const parsed = schema.safeParse({});
            if (parsed.success) {
                return parsed.data as DefaultValues<TFormValues>;
            } else {
                console.warn('Could not generate defaults directly from schema, using basic fallback.', parsed.error.flatten());
                const basicDefaults: Record<string, unknown> = {};
                flattenedFields.forEach((field) => {
                    switch (field.type) {
                        case 'text':
                        case 'textarea':
                        case 'email':
                        case 'password':
                        case 'tel':
                        case 'url':
                        case 'date':
                            basicDefaults[field.name] = '';
                            break;
                        case 'select':
                            basicDefaults[field.name] = field.options?.[0]?.value ?? '';
                            break;
                        case 'number':
                            basicDefaults[field.name] = undefined;
                            break;
                        case 'checkbox':
                            basicDefaults[field.name] = false;
                            break;
                        default:
                            basicDefaults[field.name] = undefined;
                    }
                });
                return basicDefaults as DefaultValues<TFormValues>;
            }
        } catch (e) {
            console.error('Error generating default form values:', e);
            return {} as DefaultValues<TFormValues>;
        }
    }, [schema, flattenedFields]);

    const form = useForm<TFormValues>({
        resolver: zodResolver(schema),
        defaultValues: initialData ? (initialData as DefaultValues<TFormValues>) : defaultFormValues,
    });

    const {
        handleSubmit,
        control,
        reset,
        watch,
        formState: { errors, isSubmitting, isDirty, dirtyFields },
    } = form;

    // Handle focus on first error after submission attempt
    useEffect(() => {
        if (firstErrorRef.current) {
            const errorElement = document.getElementById(firstErrorRef.current);
            if (errorElement) {
                errorElement.focus();
                firstErrorRef.current = null;
            }
        }
    }, [errors]);

    // Reset form when initialData changes
    useEffect(() => {
        if (initialData) {
            reset(initialData as DefaultValues<TFormValues>);
        } else {
            reset(defaultFormValues);
        }
    }, [initialData, reset, defaultFormValues]);

    // Watch all form values for conditional rendering
    const allValues = watch();

    // Calculate completion percentage for progress indicator
    const completionPercentage = useMemo(() => {
        if (!isDirty) return 0;
        const totalFields = Object.keys(flattenedFields).length;
        const completedFields = Object.keys(dirtyFields).length;
        return Math.min(Math.round((completedFields / totalFields) * 100), 100);
    }, [isDirty, dirtyFields, flattenedFields]);

    // Determine if a field should be visible based on its dependency
    const isFieldVisible = (field: FieldConfig<TFormValues>) => {
        if (!field.dependsOn) return true;

        const dependencyValue = allValues[field.dependsOn.field];
        const targetValue = field.dependsOn.value;
        const condition = field.dependsOn.condition || 'equals';

        switch (condition) {
            case 'equals':
                return dependencyValue === targetValue;
            case 'notEquals':
                return dependencyValue !== targetValue;
            case 'contains':
                return Array.isArray(dependencyValue) && dependencyValue.includes(targetValue);
            case 'notContains':
                return Array.isArray(dependencyValue) && !dependencyValue.includes(targetValue);
            default:
                return true;
        }
    };

    const renderField = (fieldConf: FieldConfig<TFormValues>) => {
        if (fieldConf.hidden || !isFieldVisible(fieldConf)) return null;

        const error = errors[fieldConf.name]?.message as string | undefined;

        // Set first error reference for focus management
        if (error && !firstErrorRef.current) {
            firstErrorRef.current = fieldConf.name;
        }

        const fieldWrapperClasses = cn(
            'relative',
            layout === 'horizontal' && 'flex flex-wrap items-start gap-2',
            layout === 'vertical' && 'flex flex-col gap-2',
            compact ? 'mb-2' : 'mb-4',
            fieldConf.className,
        );

        const labelClasses = cn(error ? 'text-red-600' : '', layout === 'horizontal' && 'w-1/4 pt-2 text-right', fieldConf.labelClassName);

        const inputWrapperClasses = cn('relative w-full', layout === 'horizontal' && 'flex-1', fieldConf.inputClassName);

        return (
            <div key={fieldConf.name} className={fieldWrapperClasses}>
                {fieldConf.type !== 'checkbox' && (
                    <Label htmlFor={fieldConf.name} className={labelClasses}>
                        {fieldConf.label}
                        {fieldConf.required ? ' *' : ''}
                    </Label>
                )}

                <div className={inputWrapperClasses}>
                    <Controller
                        name={fieldConf.name}
                        control={control}
                        render={({ field: controllerField }) => {
                            // Common props shared across all field types
                            const commonProps = {
                                ...controllerField,
                                id: fieldConf.name,
                                disabled: isLoading || fieldConf.disabled,
                                'aria-invalid': error ? true : false,
                                'aria-describedby': fieldConf.description ? `${fieldConf.name}-description` : undefined,
                                className: cn(
                                    error ? 'border-red-500 focus:ring-red-500' : '',
                                    fieldConf.disabled ? 'cursor-not-allowed opacity-60' : '',
                                ),
                            };

                            switch (fieldConf.type) {
                                case 'textarea':
                                    return (
                                        <Textarea
                                            {...commonProps}
                                            placeholder={fieldConf.placeholder}
                                            value={controllerField.value ?? ''}
                                            rows={fieldConf.rows || 3}
                                            autoFocus={fieldConf.autoFocus}
                                        />
                                    );
                                case 'select':
                                    return (
                                        <Select
                                            onValueChange={controllerField.onChange}
                                            value={String(controllerField.value ?? '')}
                                            defaultValue={String(controllerField.value ?? '')}
                                            disabled={commonProps.disabled}
                                        >
                                            <SelectTrigger
                                                id={fieldConf.name}
                                                className={commonProps.className}
                                                aria-invalid={commonProps['aria-invalid']}
                                                aria-describedby={commonProps['aria-describedby']}
                                            >
                                                <SelectValue placeholder={fieldConf.placeholder ?? `Select ${fieldConf.label}...`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {fieldConf.options?.map((option) => (
                                                    <SelectItem key={option.value} value={String(option.value)} disabled={option.disabled}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    );
                                case 'checkbox':
                                    return (
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id={fieldConf.name}
                                                checked={!!controllerField.value}
                                                onCheckedChange={controllerField.onChange}
                                                ref={controllerField.ref}
                                                aria-invalid={error ? 'true' : 'false'}
                                                disabled={commonProps.disabled}
                                                aria-describedby={commonProps['aria-describedby']}
                                            />
                                            <Label htmlFor={fieldConf.name} className={cn('cursor-pointer', error ? 'text-red-600' : '')}>
                                                {fieldConf.label}
                                                {fieldConf.required ? ' *' : ''}
                                            </Label>
                                        </div>
                                    );
                                case 'number':
                                    return (
                                        <Input
                                            type="number"
                                            {...commonProps}
                                            placeholder={fieldConf.placeholder}
                                            value={controllerField.value ?? ''}
                                            min={fieldConf.min}
                                            max={fieldConf.max}
                                            step={fieldConf.step}
                                            autoFocus={fieldConf.autoFocus}
                                        />
                                    );
                                case 'date': {
                                    const value = controllerField.value as unknown;
                                    const dateValue =
                                        value instanceof Date
                                            ? value.toISOString().split('T')[0]
                                            : typeof value === 'string' && value.includes('T')
                                              ? value.split('T')[0]
                                              : typeof value === 'string'
                                                ? value
                                                : '';
                                    return (
                                        <Input
                                            type="date"
                                            {...commonProps}
                                            placeholder={fieldConf.placeholder}
                                            value={dateValue}
                                            autoFocus={fieldConf.autoFocus}
                                        />
                                    );
                                }
                                case 'email':
                                    return (
                                        <Input
                                            type="email"
                                            {...commonProps}
                                            placeholder={fieldConf.placeholder}
                                            value={controllerField.value ?? ''}
                                            pattern={fieldConf.pattern}
                                            autoFocus={fieldConf.autoFocus}
                                        />
                                    );
                                case 'password':
                                    return (
                                        <Input
                                            type="password"
                                            {...commonProps}
                                            placeholder={fieldConf.placeholder}
                                            value={controllerField.value ?? ''}
                                            autoFocus={fieldConf.autoFocus}
                                        />
                                    );
                                case 'tel':
                                    return (
                                        <Input
                                            type="tel"
                                            {...commonProps}
                                            placeholder={fieldConf.placeholder}
                                            value={controllerField.value ?? ''}
                                            pattern={fieldConf.pattern}
                                            autoFocus={fieldConf.autoFocus}
                                        />
                                    );
                                case 'url':
                                    return (
                                        <Input
                                            type="url"
                                            {...commonProps}
                                            placeholder={fieldConf.placeholder}
                                            value={controllerField.value ?? ''}
                                            pattern={fieldConf.pattern}
                                            autoFocus={fieldConf.autoFocus}
                                        />
                                    );
                                case 'text':
                                default:
                                    return (
                                        <Input
                                            type="text"
                                            {...commonProps}
                                            placeholder={fieldConf.placeholder}
                                            value={controllerField.value ?? ''}
                                            pattern={fieldConf.pattern}
                                            autoFocus={fieldConf.autoFocus}
                                        />
                                    );
                            }
                        }}
                    />
                    {/* Help text */}
                    {fieldConf.description && (
                        <p id={`${fieldConf.name}-description`} className="mt-1 text-sm text-gray-500">
                            {fieldConf.description}
                        </p>
                    )}
                    {/* Error message display */}
                    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                </div>
            </div>
        );
    };

    // Render grid layout with specified number of columns
    const renderGridLayout = () => {
        return (
            <div className={`grid grid-cols-1 md:grid-cols-${gridColumns} gap-4`}>
                {flattenedFields.map((field) => (
                    <div key={field.name}>{renderField(field)}</div>
                ))}
            </div>
        );
    };

    // Render fields based on sections
    const renderSections = () => {
        return (fieldConfig as FormSection<TFormValues>[]).map((section, index) => (
            <div key={index} className="mb-6">
                {section.title && <h3 className="mb-2 text-lg font-medium">{section.title}</h3>}
                {section.description && <p className="mb-4 text-sm text-gray-600">{section.description}</p>}
                {layout === 'grid' ? (
                    <div className={`grid grid-cols-1 md:grid-cols-${gridColumns} gap-4`}>
                        {section.fields.map((field) => (
                            <div key={field.name}>{renderField(field)}</div>
                        ))}
                    </div>
                ) : (
                    section.fields.map(renderField)
                )}
            </div>
        ));
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} id={formId} className={cn('space-y-4', compact ? 'p-2' : 'p-4', className)} noValidate>
            {title && <h2 className="mb-4 text-xl font-semibold">{title}</h2>}
            {description && <p className="mb-6 text-gray-600">{description}</p>}

            {showProgressIndicator && isDirty && (
                <div className="mb-6 h-2.5 w-full rounded-full bg-gray-200">
                    <div
                        className="h-2.5 rounded-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${completionPercentage}%` }}
                        role="progressbar"
                        aria-valuenow={completionPercentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    />
                </div>
            )}

            {hasSections ? renderSections() : layout === 'grid' ? renderGridLayout() : flattenedFields.map(renderField)}

            <div className="flex justify-end gap-2 pt-4">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading || isSubmitting}>
                        {cancelButtonText}
                    </Button>
                )}
                <Button type="submit" disabled={isLoading || isSubmitting} className="min-w-[100px]">
                    {isLoading || isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Submitting...</span>
                        </span>
                    ) : (
                        submitButtonText
                    )}
                </Button>
            </div>
        </form>
    );
}
