/**
 * Smart Report Builder section configurations.
 * Each report type maps to a list of sections, each with fields.
 * Fields are stored as key-value pairs in the report's extra_data object.
 */

export const SMART_SECTIONS = {
  traffic_stop: [
    {
      key: 'driver_info',
      label: 'Driver Information',
      fields: [
        { key: 'driver_name', label: 'Driver Name', type: 'text' },
        { key: 'license_number', label: 'License #', type: 'text' },
        { key: 'license_status', label: 'License Status', type: 'text' },
      ],
    },
    {
      key: 'vehicle_info',
      label: 'Vehicle Information',
      fields: [
        { key: 'plate', label: 'License Plate', type: 'text' },
        { key: 'make_model', label: 'Make / Model', type: 'text' },
        { key: 'color', label: 'Color', type: 'text' },
        { key: 'vehicle_year', label: 'Year', type: 'text' },
      ],
    },
    {
      key: 'citation',
      label: 'Citation Fields',
      fields: [
        { key: 'citation_number', label: 'Citation #', type: 'text' },
        { key: 'violation', label: 'Violation', type: 'text' },
        { key: 'fine_amount', label: 'Fine Amount', type: 'text' },
      ],
    },
    {
      key: 'warnings',
      label: 'Warnings',
      fields: [
        { key: 'warnings_given', label: 'Warnings Issued', type: 'textarea' },
      ],
    },
  ],
  arrest: [
    {
      key: 'charges',
      label: 'Charges',
      fields: [
        { key: 'charges_listed', label: 'Charges', type: 'textarea' },
        { key: 'charge_codes', label: 'Charge Codes', type: 'text' },
      ],
    },
    {
      key: 'booking',
      label: 'Booking Information',
      fields: [
        { key: 'booking_number', label: 'Booking #', type: 'text' },
        { key: 'booking_location', label: 'Booking Location', type: 'text' },
      ],
    },
    {
      key: 'miranda',
      label: 'Miranda Warning',
      fields: [
        { key: 'miranda_read', label: 'Miranda Read? (Y/N)', type: 'text' },
        { key: 'miranda_time', label: 'Time Read', type: 'text' },
      ],
    },
    {
      key: 'jail_time',
      label: 'Jail Time',
      fields: [
        { key: 'jail_sentence', label: 'Sentence', type: 'text' },
      ],
    },
  ],
  use_of_force: [
    {
      key: 'force_used',
      label: 'Force Used',
      fields: [
        { key: 'force_type', label: 'Type of Force', type: 'textarea' },
      ],
    },
    {
      key: 'justification',
      label: 'Justification',
      fields: [
        { key: 'justification', label: 'Justification', type: 'textarea' },
      ],
    },
    {
      key: 'injuries',
      label: 'Injuries',
      fields: [
        { key: 'injuries_sustained', label: 'Injuries Sustained', type: 'textarea' },
      ],
    },
  ],
  fire: [
    {
      key: 'apparatus',
      label: 'Apparatus',
      fields: [
        { key: 'apparatus_dispatched', label: 'Apparatus Dispatched', type: 'text' },
      ],
    },
    {
      key: 'cause',
      label: 'Cause',
      fields: [
        { key: 'fire_cause', label: 'Cause of Fire', type: 'text' },
      ],
    },
    {
      key: 'damage',
      label: 'Damage Assessment',
      fields: [
        { key: 'damage_estimate', label: 'Damage Estimate', type: 'textarea' },
        { key: 'structural_status', label: 'Structural Status', type: 'text' },
      ],
    },
  ],
  ems: [
    {
      key: 'patient',
      label: 'Patient Information',
      fields: [
        { key: 'patient_name', label: 'Patient Name', type: 'text' },
        { key: 'patient_age', label: 'Age', type: 'text' },
        { key: 'patient_condition', label: 'Condition', type: 'text' },
      ],
    },
    {
      key: 'transport',
      label: 'Transport Details',
      fields: [
        { key: 'transport_method', label: 'Transport Method', type: 'text' },
        { key: 'transported_by', label: 'Transported By', type: 'text' },
      ],
    },
    {
      key: 'hospital',
      label: 'Hospital',
      fields: [
        { key: 'hospital_name', label: 'Hospital', type: 'text' },
        { key: 'er_status', label: 'ER Status', type: 'text' },
      ],
    },
  ],
  incident: null,
  supplement: null,
};

export function getSmartSections(reportType) {
  return SMART_SECTIONS[reportType] || null;
}