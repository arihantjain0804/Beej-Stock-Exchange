/**
 * BSE Seed Data — mirrors v23 hardcoded JS mock data exactly.
 * All prices in INR.
 */

const FARMER_USERS = [
  { phone: '+919876500001', full_name: 'Ranjit Singh Dhaliwal', role: 'farmer', kyc_status: 'verified', state: 'Punjab',        fpo: 'Punjab Wheat Growers Collective' },
  { phone: '+919876500002', full_name: 'Kavitha Reddy',         role: 'farmer', kyc_status: 'verified', state: 'Telangana',     fpo: 'Deccan Agri Producers' },
  { phone: '+919876500003', full_name: 'Suresh Patil',          role: 'farmer', kyc_status: 'verified', state: 'Maharashtra',   fpo: 'Vidarbha Cotton FPO' },
  { phone: '+919876500004', full_name: 'Meena Devi',            role: 'farmer', kyc_status: 'verified', state: 'Uttar Pradesh', fpo: 'Eastern UP Rice Consortium' },
  { phone: '+919876500005', full_name: 'Arjun Nair',            role: 'farmer', kyc_status: 'verified', state: 'Kerala',        fpo: 'Malabar Spice Farmers' },
];

const INVESTOR_USERS = [
  { phone: '+919900000001', full_name: 'Priya Sharma',     role: 'investor', kyc_status: 'verified',  email: 'priya@example.com' },
  { phone: '+919900000002', full_name: 'Vikram Mehta',     role: 'investor', kyc_status: 'verified',  email: 'vikram@example.com' },
  { phone: '+919900000003', full_name: 'Demo Investor',    role: 'investor', kyc_status: 'verified',  email: 'demo@bse.in' },
];

// symbol, name, crop_type, state, district, harvest_date, total_supply, token_price,
// current_price, expected_yield_pct, status, land_area_acres, is_beej50
const CROP_TOKENS = [
  {
    symbol: 'WHTPUN24', name: 'Punjab Wheat Rabi 2024',
    crop_type: 'Wheat', state: 'Punjab', district: 'Ludhiana',
    harvest_date: '2024-04-15', total_supply: 50000, token_price_inr: 100,
    current_price_inr: 112.50, prev_close_inr: 110.20,
    day_high_inr: 113.00, day_low_inr: 109.80,
    expected_yield_pct: 14.2, status: 'active', land_area_acres: 45.5,
    is_beej50: true, farmer_index: 0,
    description: 'Premium HD-2967 variety wheat from the fertile plains of Ludhiana. Certified organic, contract-farmed for export-quality flour mills.',
    smart_contract_addr: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12',
  },
  {
    symbol: 'RICETEL24', name: 'Telangana Sona Masuri Rice',
    crop_type: 'Rice', state: 'Telangana', district: 'Nalgonda',
    harvest_date: '2024-11-30', total_supply: 80000, token_price_inr: 85,
    current_price_inr: 91.30, prev_close_inr: 93.10,
    day_high_inr: 94.00, day_low_inr: 90.50,
    expected_yield_pct: 11.8, status: 'active', land_area_acres: 62.0,
    is_beej50: true, farmer_index: 1,
    description: 'Sona Masuri Kharif paddy from rain-fed fields of Nalgonda. Preferred by South Indian households, direct mill tie-up ensures offtake guarantee.',
    smart_contract_addr: '0x2b3c4d5e6f7890abcdef1234567890abcdef1234',
  },
  {
    symbol: 'COTMAH24', name: 'Vidarbha BT Cotton',
    crop_type: 'Cotton', state: 'Maharashtra', district: 'Yavatmal',
    harvest_date: '2024-12-10', total_supply: 35000, token_price_inr: 145,
    current_price_inr: 158.75, prev_close_inr: 155.00,
    day_high_inr: 160.20, day_low_inr: 154.30,
    expected_yield_pct: 16.5, status: 'active', land_area_acres: 38.8,
    is_beej50: true, farmer_index: 2,
    description: 'BT Cotton Shankar-6 variety from Yavatmal\'s black cotton soil belt. Forward contract signed with Welspun India for full offtake.',
    smart_contract_addr: '0x3c4d5e6f7890abcdef1234567890abcdef123456',
  },
  {
    symbol: 'SOYMP24', name: 'Madhya Pradesh Yellow Soybean',
    crop_type: 'Soybean', state: 'Madhya Pradesh', district: 'Indore',
    harvest_date: '2024-10-05', total_supply: 45000, token_price_inr: 120,
    current_price_inr: 134.20, prev_close_inr: 130.50,
    day_high_inr: 136.00, day_low_inr: 129.70,
    expected_yield_pct: 13.9, status: 'harvested', land_area_acres: 55.2,
    is_beej50: true, farmer_index: 3,
    description: 'JS 9305 soybean from the Malwa plateau. Harvest complete — yield verification in progress for settlement.',
    smart_contract_addr: '0x4d5e6f7890abcdef1234567890abcdef12345678',
  },
  {
    symbol: 'PEPKER24', name: 'Kerala Black Pepper',
    crop_type: 'Black Pepper', state: 'Kerala', district: 'Wayanad',
    harvest_date: '2025-02-28', total_supply: 15000, token_price_inr: 320,
    current_price_inr: 287.60, prev_close_inr: 295.00,
    day_high_inr: 298.00, day_low_inr: 284.00,
    expected_yield_pct: 9.5, status: 'active', land_area_acres: 12.0,
    is_beej50: true, farmer_index: 4,
    description: 'Malabar Garbled Special black pepper from Wayanad\'s high-altitude estates. Export-grade, GI-tagged, contracted with McCormick for spice blends.',
    smart_contract_addr: '0x5e6f7890abcdef1234567890abcdef1234567890',
  },
  {
    symbol: 'MZKAR24', name: 'Karnataka Hybrid Maize',
    crop_type: 'Maize', state: 'Karnataka', district: 'Davangere',
    harvest_date: '2024-09-20', total_supply: 60000, token_price_inr: 78,
    current_price_inr: 82.40, prev_close_inr: 81.00,
    day_high_inr: 83.20, day_low_inr: 80.60,
    expected_yield_pct: 10.2, status: 'active', land_area_acres: 70.0,
    is_beej50: true, farmer_index: 0,
    description: 'Pioneer 30V92 hybrid maize from Davangere\'s red laterite soil. Poultry feed supply contract with Suguna Foods for full harvest.',
    smart_contract_addr: '0x6f7890abcdef1234567890abcdef123456789012',
  },
  {
    symbol: 'TURGUJ24', name: 'Gujarat Bt-2 Tur Dal',
    crop_type: 'Pigeonpea', state: 'Gujarat', district: 'Junagadh',
    harvest_date: '2025-01-15', total_supply: 28000, token_price_inr: 195,
    current_price_inr: 218.90, prev_close_inr: 212.00,
    day_high_inr: 221.00, day_low_inr: 210.50,
    expected_yield_pct: 18.1, status: 'active', land_area_acres: 33.0,
    is_beej50: true, farmer_index: 2,
    description: 'BSMR-736 tur dal from Saurashtra region. High protein content, contracted with ITC agri-business division at MSP+12%.',
    smart_contract_addr: '0x7890abcdef1234567890abcdef12345678901234',
  },
  {
    symbol: 'GRPRAJ24', name: 'Rajasthan Mustard',
    crop_type: 'Mustard', state: 'Rajasthan', district: 'Bharatpur',
    harvest_date: '2024-03-25', total_supply: 42000, token_price_inr: 110,
    current_price_inr: 110.00, prev_close_inr: 110.00,
    day_high_inr: 110.00, day_low_inr: 110.00,
    expected_yield_pct: 12.4, actual_yield_pct: 13.1, status: 'settled', land_area_acres: 48.0,
    is_beej50: false, farmer_index: 3,
    description: 'RH-749 mustard from Bharatpur. Harvest settled — 13.1% actual yield delivered to token holders.',
    smart_contract_addr: '0x890abcdef1234567890abcdef123456789012345',
  },
];

module.exports = { FARMER_USERS, INVESTOR_USERS, CROP_TOKENS };
