import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Globe2,
  Landmark,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Sprout,
  UserRound,
  WalletCards,
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext.tsx';
import { api } from '../services/api.ts';

interface FarmerProfileData {
  state?: string;
  district?: string;
  taluk?: string;
  village?: string;
  country?: string;
  fatherName?: string;
  totalAcreage?: number;
  landUnit?: string;
  landOwnership?: string;
  surveyNumber?: string;
  pincode?: string;
  cropType?: string;
  irrigationType?: string;
  farmingType?: string;
}

interface AdminProfileData {
  name?: string;
  fatherName?: string;
  phone?: string;
  designation?: string;
  post?: string;
  department?: string;
  joiningDate?: string;
  placeOfPosting?: string;
  officeAddress?: string;
  officePhone?: string;
  employeeId?: string;
  salary?: number;
  employmentType?: string;
  qualification?: string;
  experience?: number;
  pincode?: string;
  state?: string;
  district?: string;
  country?: string;
  reportingOfficer?: string;
  workLocation?: string;
  status?: string;
}

interface ProfileResponse {
  user: any;
  farmerProfile?: FarmerProfileData | null;
  adminProfile?: AdminProfileData | null;
}

const INDIA_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
];

const LAND_UNITS = ['Acres', 'Hectares', 'Guntas', 'Cents'];

const DEFAULT_FARMER: FarmerProfileData = {
  state: '',
  district: '',
  taluk: '',
  village: '',
  country: 'India',
  fatherName: '',
  totalAcreage: 0,
  landUnit: 'Acres',
  landOwnership: 'Owned',
  surveyNumber: '',
  pincode: '',
  cropType: '',
  irrigationType: '',
  farmingType: '',
};

const DEFAULT_ADMIN: AdminProfileData = {
  name: '',
  fatherName: '',
  phone: '',
  designation: '',
  post: '',
  department: '',
  joiningDate: '',
  placeOfPosting: '',
  officeAddress: '',
  officePhone: '',
  employeeId: '',
  salary: 0,
  employmentType: 'Permanent',
  qualification: '',
  experience: 0,
  pincode: '',
  state: '',
  district: '',
  country: 'India',
  reportingOfficer: '',
  workLocation: '',
  status: 'Active',
};

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const [farmerProfile, setFarmerProfile] =
    useState<FarmerProfileData>(DEFAULT_FARMER);

  const [adminProfile, setAdminProfile] =
    useState<AdminProfileData>(DEFAULT_ADMIN);

  /*
   * Supports common role values:
   * farmer, admin, administrator, officer, staff, superadmin
   */
  const normalizedRole = String(
    user?.role ??
      (user as any)?.userRole ??
      (user as any)?.user_type ??
      (user as any)?.userType ??
      ''
  )
    .toLowerCase()
    .replace(/[\s_-]/g, '');

  const isAdmin =
    normalizedRole === 'admin' ||
    normalizedRole === 'administrator' ||
    normalizedRole === 'superadmin' ||
    normalizedRole === 'officer' ||
    normalizedRole === 'staff' ||
    (user as any)?.is_staff === true ||
    (user as any)?.isStaff === true ||
    (user as any)?.is_superuser === true;

  const isFarmer = !isAdmin;

  const profileTitle = useMemo(
    () => (isFarmer ? 'Farmer Profile' : 'Admin / Officer Profile'),
    [isFarmer]
  );

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError('');

        const data: ProfileResponse = await api.getProfile();

        if (data.user) {
          setName(data.user.name || '');
          setPhone(data.user.phone || '');
          updateUser(data.user);
        }

        if (data.farmerProfile) {
          setFarmerProfile({
            ...DEFAULT_FARMER,
            ...data.farmerProfile,
          });
        }

        if (data.adminProfile) {
          setAdminProfile({
            ...DEFAULT_ADMIN,
            ...data.adminProfile,
          });
        }

        /*
         * If backend does not yet return adminProfile,
         * initialize the admin form from user data.
         */
        if (!data.adminProfile && isAdmin) {
          setAdminProfile({
            ...DEFAULT_ADMIN,
            name: data.user?.name || '',
            phone: data.user?.phone || '',
            ...data.user,
          });
        }
      } catch (err: any) {
        setError(err?.message || 'Unable to load your profile.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const updateFarmerField = <K extends keyof FarmerProfileData>(
    field: K,
    value: FarmerProfileData[K]
  ) => {
    setFarmerProfile((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateAdminField = <K extends keyof AdminProfileData>(
    field: K,
    value: AdminProfileData[K]
  ) => {
    setAdminProfile((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleFarmerSave = async (event: React.FormEvent) => {
    event.preventDefault();

    setSaving(true);
    setMessage('');
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      setSaving(false);
      return;
    }

    if (
      farmerProfile.totalAcreage !== undefined &&
      Number(farmerProfile.totalAcreage) < 0
    ) {
      setError('Land area cannot be negative.');
      setSaving(false);
      return;
    }

    try {
      const data = await api.updateProfile({
        name: name.trim(),
        phone,

        fatherName: farmerProfile.fatherName,
        village: farmerProfile.village,
        taluk: farmerProfile.taluk,
        district: farmerProfile.district,
        state: farmerProfile.state,
        country: farmerProfile.country,

        totalAcreage: Number(farmerProfile.totalAcreage || 0),
        landUnit: farmerProfile.landUnit,
        landOwnership: farmerProfile.landOwnership,

        surveyNumber: farmerProfile.surveyNumber,
        pincode: farmerProfile.pincode,

        cropType: farmerProfile.cropType,
        irrigationType: farmerProfile.irrigationType,
        farmingType: farmerProfile.farmingType,
      });

      if (data?.user) {
        updateUser(data.user);
      }

      if (data?.farmerProfile) {
        setFarmerProfile({
          ...DEFAULT_FARMER,
          ...data.farmerProfile,
        });
      }

      setMessage('Farmer profile updated successfully.');
    } catch (err: any) {
      setError(err?.message || 'Unable to update your farmer profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAdminSave = async (event: React.FormEvent) => {
    event.preventDefault();

    setSaving(true);
    setMessage('');
    setError('');

    if (!adminProfile.name?.trim()) {
      setError('Please enter the admin/officer name.');
      setSaving(false);
      return;
    }

    try {
      const data = await api.updateProfile({
        name: adminProfile.name.trim(),
        phone: adminProfile.phone,

        fatherName: adminProfile.fatherName,
        designation: adminProfile.designation,
        post: adminProfile.post,
        department: adminProfile.department,

        joiningDate: adminProfile.joiningDate,
        placeOfPosting: adminProfile.placeOfPosting,

        officeAddress: adminProfile.officeAddress,
        officePhone: adminProfile.officePhone,

        employeeId: adminProfile.employeeId,
        salary: Number(adminProfile.salary || 0),

        employmentType: adminProfile.employmentType,
        qualification: adminProfile.qualification,
        experience: Number(adminProfile.experience || 0),

        pincode: adminProfile.pincode,
        state: adminProfile.state,
        district: adminProfile.district,
        country: adminProfile.country,

        reportingOfficer: adminProfile.reportingOfficer,
        workLocation: adminProfile.workLocation,
        status: adminProfile.status,
      });

      if (data?.user) {
        updateUser(data.user);
      }

      if (data?.adminProfile) {
        setAdminProfile({
          ...DEFAULT_ADMIN,
          ...data.adminProfile,
        });
      }

      setMessage('Admin / Officer profile updated successfully.');
    } catch (err: any) {
      setError(err?.message || 'Unable to update the admin profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-stone-500 font-medium">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-emerald-50/30 to-white px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto space-y-6 pb-12">

        {/* =========================================================
            PROFILE HEADER
        ========================================================== */}
        <section
          className={`rounded-[2rem] p-6 sm:p-8 relative overflow-hidden text-white ${
            isFarmer
              ? 'bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-800'
              : 'bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-900'
          }`}
        >
          <Sprout className="absolute -right-8 -bottom-12 w-56 h-56 text-white/5" />

          <div className="absolute right-6 top-6 hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur">
            {isFarmer ? (
              <>
                <Sprout className="w-4 h-4 text-emerald-200" />
                <span className="text-xs font-bold text-emerald-100">
                  FARMER ACCOUNT
                </span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-200" />
                <span className="text-xs font-bold text-emerald-100">
                  ADMIN / OFFICER
                </span>
              </>
            )}
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-white/10 border border-white/15 flex items-center justify-center shadow-xl">
              {isFarmer ? (
                <Sprout className="w-10 h-10 text-emerald-200" />
              ) : (
                <ShieldCheck className="w-10 h-10 text-emerald-200" />
              )}
            </div>

            <div>
              <p className="text-sm text-emerald-200 font-bold uppercase tracking-[0.18em]">
                {isFarmer ? 'My account' : 'Official account'}
              </p>

              <h1 className="text-3xl sm:text-4xl font-black mt-1">
                {isFarmer ? name || user?.name : adminProfile.name || name}
              </h1>

              <p className="text-emerald-100 mt-2">
                {isFarmer
                  ? 'Manage your personal and farm information'
                  : `${adminProfile.designation || adminProfile.post || user?.role || 'Administrator'} · ${adminProfile.department || 'Administration'}`}
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================
            ALERTS
        ========================================================== */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Something went wrong</p>
              <p className="text-sm mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {message && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="font-semibold">{message}</span>
          </div>
        )}

        {/* =========================================================
            FARMER PROFILE
        ========================================================== */}
        {isFarmer && (
          <form onSubmit={handleFarmerSave} className="space-y-6">

            {/* PERSONAL INFORMATION */}
            <section className="profile-card">
              <div className="profile-section-header">
                <div className="profile-icon farmer-icon">
                  <UserRound className="w-5 h-5" />
                </div>

                <div>
                  <h2 className="profile-title">Personal information</h2>
                  <p className="profile-subtitle">
                    Your basic identity and contact details.
                  </p>
                </div>
              </div>

              <div className="profile-grid">

                <ProfileInput
                  label="Full name"
                  value={name}
                  onChange={setName}
                  icon={<UserRound />}
                  required
                  placeholder="Enter your full name"
                />

                <ProfileInput
                  label="Father's name"
                  value={farmerProfile.fatherName || ''}
                  onChange={(value) =>
                    updateFarmerField('fatherName', value)
                  }
                  icon={<UserRound />}
                  placeholder="Enter father's name"
                />

                <ProfileInput
                  label="Mobile number"
                  value={phone}
                  onChange={(value) =>
                    setPhone(value.replace(/\D/g, '').slice(0, 10))
                  }
                  icon={<Phone />}
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10 digit mobile number"
                />

                <div>
                  <label className="field-label">Email address</label>
                  <div className="readonly-field">
                    <Mail className="w-4 h-4 text-stone-400" />
                    <span className="truncate">
                      {user?.email || 'Email not available'}
                    </span>

                    <span className="ml-auto text-xs font-bold text-emerald-700 whitespace-nowrap">
                      Verified
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* LOCATION */}
            <section className="profile-card">
              <div className="profile-section-header">
                <div className="profile-icon farmer-icon">
                  <MapPin className="w-5 h-5" />
                </div>

                <div>
                  <h2 className="profile-title">Farm location</h2>
                  <p className="profile-subtitle">
                    Keep your village and administrative location accurate
                    for schemes, advisories and services.
                  </p>
                </div>
              </div>

              <div className="profile-grid">

                <ProfileInput
                  label="Village"
                  value={farmerProfile.village || ''}
                  onChange={(value) =>
                    updateFarmerField('village', value)
                  }
                  icon={<MapPin />}
                  placeholder="Enter village"
                  required
                />

                <ProfileInput
                  label="Taluk"
                  value={farmerProfile.taluk || ''}
                  onChange={(value) =>
                    updateFarmerField('taluk', value)
                  }
                  placeholder="Enter taluk"
                  required
                />

                <ProfileInput
                  label="District"
                  value={farmerProfile.district || ''}
                  onChange={(value) =>
                    updateFarmerField('district', value)
                  }
                  placeholder="Enter district"
                  required
                />

                <SelectInput
                  label="State"
                  value={farmerProfile.state || ''}
                  onChange={(value) =>
                    updateFarmerField('state', value)
                  }
                  options={INDIA_STATES}
                  placeholder="Select state"
                  required
                />

                <ProfileInput
                  label="Country"
                  value={farmerProfile.country || 'India'}
                  onChange={(value) =>
                    updateFarmerField('country', value)
                  }
                  icon={<Globe2 />}
                  placeholder="Country"
                />

                <ProfileInput
                  label="PIN code"
                  value={farmerProfile.pincode || ''}
                  onChange={(value) =>
                    updateFarmerField(
                      'pincode',
                      value.replace(/\D/g, '').slice(0, 6)
                    )
                  }
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6 digit PIN"
                />
              </div>
            </section>

            {/* LAND DETAILS */}
            <section className="profile-card">
              <div className="profile-section-header">
                <div className="profile-icon farmer-icon">
                  <Landmark className="w-5 h-5" />
                </div>

                <div>
                  <h2 className="profile-title">Land & farm details</h2>
                  <p className="profile-subtitle">
                    Add your land information so AgriGo can provide more
                    relevant agricultural services.
                  </p>
                </div>
              </div>

              <div className="profile-grid">

                <div>
                  <label className="field-label">
                    Total land area
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={farmerProfile.totalAcreage ?? 0}
                      onChange={(event) =>
                        updateFarmerField(
                          'totalAcreage',
                          Number(event.target.value)
                        )
                      }
                      className="form-input"
                      placeholder="0"
                    />

                    <select
                      value={farmerProfile.landUnit || 'Acres'}
                      onChange={(event) =>
                        updateFarmerField(
                          'landUnit',
                          event.target.value
                        )
                      }
                      className="form-input max-w-[130px]"
                    >
                      {LAND_UNITS.map((unit) => (
                        <option key={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <SelectInput
                  label="Land ownership"
                  value={farmerProfile.landOwnership || 'Owned'}
                  onChange={(value) =>
                    updateFarmerField('landOwnership', value)
                  }
                  options={[
                    'Owned',
                    'Leased',
                    'Family Land',
                    'Joint Ownership',
                    'Other',
                  ]}
                />

                <ProfileInput
                  label="Survey / land number"
                  value={farmerProfile.surveyNumber || ''}
                  onChange={(value) =>
                    updateFarmerField('surveyNumber', value)
                  }
                  icon={<Landmark />}
                  placeholder="Survey number"
                />

                <ProfileInput
                  label="Main crop"
                  value={farmerProfile.cropType || ''}
                  onChange={(value) =>
                    updateFarmerField('cropType', value)
                  }
                  icon={<Sprout />}
                  placeholder="e.g. Rice, Ragi, Tomato"
                />

                <SelectInput
                  label="Irrigation type"
                  value={farmerProfile.irrigationType || ''}
                  onChange={(value) =>
                    updateFarmerField('irrigationType', value)
                  }
                  options={[
                    'Rainfed',
                    'Borewell',
                    'Open Well',
                    'Canal',
                    'Drip Irrigation',
                    'Sprinkler',
                    'River',
                    'Other',
                  ]}
                  placeholder="Select irrigation type"
                />

                <SelectInput
                  label="Farming type"
                  value={farmerProfile.farmingType || ''}
                  onChange={(value) =>
                    updateFarmerField('farmingType', value)
                  }
                  options={[
                    'Conventional Farming',
                    'Organic Farming',
                    'Natural Farming',
                    'Mixed Farming',
                    'Contract Farming',
                    'Other',
                  ]}
                  placeholder="Select farming type"
                />
              </div>
            </section>

            {/* FARMER INFORMATION CARD */}
            <section className="rounded-2xl bg-gradient-to-r from-emerald-900 to-green-800 text-white p-6">
              <div className="flex gap-4">
                <Sprout className="w-7 h-7 text-emerald-200 shrink-0" />

                <div>
                  <h3 className="font-black text-lg">
                    Why complete your farmer profile?
                  </h3>

                  <p className="text-sm text-emerald-100 mt-2 leading-6">
                    A complete profile helps AgriGo personalize crop
                    advisories, government schemes, marketplace services,
                    equipment rental, weather alerts and agricultural
                    recommendations for your farm.
                  </p>
                </div>
              </div>
            </section>

            {/* SAVE */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="save-button"
              >
                <Save className="w-4 h-4" />

                {saving
                  ? 'Saving profile...'
                  : 'Save farmer profile'}
              </button>
            </div>
          </form>
        )}

        {/* =========================================================
            ADMIN / OFFICER PROFILE
        ========================================================== */}
        {isAdmin && (
          <form onSubmit={handleAdminSave} className="space-y-6">

            {/* OFFICIAL IDENTITY */}
            <section className="profile-card">
              <div className="profile-section-header">
                <div className="profile-icon admin-icon">
                  <ShieldCheck className="w-5 h-5" />
                </div>

                <div>
                  <h2 className="profile-title">
                    Official identity
                  </h2>
                  <p className="profile-subtitle">
                    Employee and official account information.
                  </p>
                </div>
              </div>

              <div className="profile-grid">

                <ProfileInput
                  label="Full name"
                  value={adminProfile.name || ''}
                  onChange={(value) =>
                    updateAdminField('name', value)
                  }
                  icon={<UserRound />}
                  placeholder="Official full name"
                  required
                />

                <ProfileInput
                  label="Father's name"
                  value={adminProfile.fatherName || ''}
                  onChange={(value) =>
                    updateAdminField('fatherName', value)
                  }
                  icon={<UserRound />}
                  placeholder="Father's name"
                />

                <ProfileInput
                  label="Employee ID"
                  value={adminProfile.employeeId || ''}
                  onChange={(value) =>
                    updateAdminField('employeeId', value)
                  }
                  icon={<ShieldCheck />}
                  placeholder="Employee / Officer ID"
                />

                <div>
                  <label className="field-label">
                    Official email
                  </label>

                  <div className="readonly-field">
                    <Mail className="w-4 h-4 text-stone-400" />
                    <span className="truncate">
                      {user?.email || 'Email not available'}
                    </span>

                    <span className="ml-auto text-xs font-bold text-emerald-700">
                      Verified
                    </span>
                  </div>
                </div>

                <ProfileInput
                  label="Personal / official mobile"
                  value={adminProfile.phone || phone}
                  onChange={(value) =>
                    updateAdminField(
                      'phone',
                      value.replace(/\D/g, '').slice(0, 10)
                    )
                  }
                  icon={<Phone />}
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10 digit mobile number"
                />

                <ProfileInput
                  label="Office phone"
                  value={adminProfile.officePhone || ''}
                  onChange={(value) =>
                    updateAdminField(
                      'officePhone',
                      value.replace(/[^\d+\- ]/g, '')
                    )
                  }
                  icon={<Phone />}
                  placeholder="Office contact number"
                />
              </div>
            </section>

            {/* JOB DETAILS */}
            <section className="profile-card">
              <div className="profile-section-header">
                <div className="profile-icon admin-icon">
                  <BriefcaseBusiness className="w-5 h-5" />
                </div>

                <div>
                  <h2 className="profile-title">
                    Employment & designation
                  </h2>

                  <p className="profile-subtitle">
                    Official posting, role and employment information.
                  </p>
                </div>
              </div>

              <div className="profile-grid">

                <ProfileInput
                  label="Post"
                  value={adminProfile.post || ''}
                  onChange={(value) =>
                    updateAdminField('post', value)
                  }
                  icon={<BriefcaseBusiness />}
                  placeholder="e.g. Agriculture Officer"
                />

                <ProfileInput
                  label="Designation"
                  value={adminProfile.designation || ''}
                  onChange={(value) =>
                    updateAdminField('designation', value)
                  }
                  placeholder="Official designation"
                />

                <ProfileInput
                  label="Department"
                  value={adminProfile.department || ''}
                  onChange={(value) =>
                    updateAdminField('department', value)
                  }
                  icon={<Building2 />}
                  placeholder="e.g. Agriculture Department"
                />

                <SelectInput
                  label="Employment type"
                  value={adminProfile.employmentType || 'Permanent'}
                  onChange={(value) =>
                    updateAdminField(
                      'employmentType',
                      value
                    )
                  }
                  options={[
                    'Permanent',
                    'Temporary',
                    'Contract',
                    'Consultant',
                    'Intern',
                    'Other',
                  ]}
                />

                <div>
                  <label className="field-label">
                    Joining date
                  </label>

                  <div className="relative">
                    <CalendarDays className="field-icon" />

                    <input
                      type="date"
                      value={adminProfile.joiningDate || ''}
                      onChange={(event) =>
                        updateAdminField(
                          'joiningDate',
                          event.target.value
                        )
                      }
                      className="form-input pl-10"
                    />
                  </div>
                </div>

                <ProfileInput
                  label="Years of experience"
                  value={String(adminProfile.experience || '')}
                  onChange={(value) =>
                    updateAdminField(
                      'experience',
                      Number(value.replace(/\D/g, '').slice(0, 2))
                    )
                  }
                  inputMode="numeric"
                  placeholder="Years"
                />
              </div>
            </section>

            {/* POSTING LOCATION */}
            <section className="profile-card">
              <div className="profile-section-header">
                <div className="profile-icon admin-icon">
                  <MapPin className="w-5 h-5" />
                </div>

                <div>
                  <h2 className="profile-title">
                    Posting & office location
                  </h2>

                  <p className="profile-subtitle">
                    Where the officer is currently posted and working.
                  </p>
                </div>
              </div>

              <div className="profile-grid">

                <ProfileInput
                  label="Place of posting"
                  value={adminProfile.placeOfPosting || ''}
                  onChange={(value) =>
                    updateAdminField(
                      'placeOfPosting',
                      value
                    )
                  }
                  icon={<MapPin />}
                  placeholder="e.g. Tumakuru"
                />

                <ProfileInput
                  label="Work location"
                  value={adminProfile.workLocation || ''}
                  onChange={(value) =>
                    updateAdminField(
                      'workLocation',
                      value
                    )
                  }
                  placeholder="Office / branch / unit"
                />

                <ProfileInput
                  label="District"
                  value={adminProfile.district || ''}
                  onChange={(value) =>
                    updateAdminField('district', value)
                  }
                  placeholder="District"
                />

                <SelectInput
                  label="State"
                  value={adminProfile.state || ''}
                  onChange={(value) =>
                    updateAdminField('state', value)
                  }
                  options={INDIA_STATES}
                  placeholder="Select state"
                />

                <ProfileInput
                  label="Country"
                  value={adminProfile.country || 'India'}
                  onChange={(value) =>
                    updateAdminField('country', value)
                  }
                  icon={<Globe2 />}
                  placeholder="Country"
                />

                <ProfileInput
                  label="PIN code"
                  value={adminProfile.pincode || ''}
                  onChange={(value) =>
                    updateAdminField(
                      'pincode',
                      value.replace(/\D/g, '').slice(0, 6)
                    )
                  }
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6 digit PIN"
                />
              </div>

              <div className="mt-5">
                <label className="field-label">
                  Complete office address
                </label>

                <textarea
                  value={adminProfile.officeAddress || ''}
                  onChange={(event) =>
                    updateAdminField(
                      'officeAddress',
                      event.target.value
                    )
                  }
                  rows={4}
                  placeholder="Enter complete office address..."
                  className="form-input resize-none"
                />
              </div>
            </section>

            {/* PROFESSIONAL INFORMATION */}
            <section className="profile-card">
              <div className="profile-section-header">
                <div className="profile-icon admin-icon">
                  <BriefcaseBusiness className="w-5 h-5" />
                </div>

                <div>
                  <h2 className="profile-title">
                    Professional information
                  </h2>

                  <p className="profile-subtitle">
                    Additional information useful for administration.
                  </p>
                </div>
              </div>

              <div className="profile-grid">

                <ProfileInput
                  label="Highest qualification"
                  value={adminProfile.qualification || ''}
                  onChange={(value) =>
                    updateAdminField(
                      'qualification',
                      value
                    )
                  }
                  placeholder="e.g. B.Sc Agriculture"
                />

                <ProfileInput
                  label="Reporting officer"
                  value={adminProfile.reportingOfficer || ''}
                  onChange={(value) =>
                    updateAdminField(
                      'reportingOfficer',
                      value
                    )
                  }
                  placeholder="Reporting officer name"
                />

                <SelectInput
                  label="Account / employment status"
                  value={adminProfile.status || 'Active'}
                  onChange={(value) =>
                    updateAdminField('status', value)
                  }
                  options={[
                    'Active',
                    'On Leave',
                    'Transferred',
                    'Suspended',
                    'Retired',
                    'Inactive',
                  ]}
                />

                <div>
                  <label className="field-label">
                    Monthly salary
                  </label>

                  <div className="relative">
                    <WalletCards className="field-icon" />

                    <input
                      type="number"
                      min="0"
                      value={adminProfile.salary || 0}
                      onChange={(event) =>
                        updateAdminField(
                          'salary',
                          Number(event.target.value)
                        )
                      }
                      className="form-input pl-10"
                      placeholder="Enter salary"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-amber-50 border border-amber-200 p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />

                  <div>
                    <p className="font-bold text-amber-900">
                      Salary information
                    </p>

                    <p className="text-sm text-amber-800 mt-1">
                      Salary and other sensitive employment fields should
                      be editable only by authorized administrators.
                      Consider making these fields read-only for ordinary
                      officers.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ADMIN ACCESS INFORMATION */}
            <section className="rounded-2xl border border-slate-200 bg-slate-900 text-white p-6">
              <div className="flex gap-4">
                <ShieldCheck className="w-7 h-7 text-emerald-300 shrink-0" />

                <div>
                  <h3 className="font-black text-lg">
                    Administrator access
                  </h3>

                  <p className="text-sm text-slate-300 mt-2 leading-6">
                    Your account role controls which AgriGo management
                    modules you can access. Keep official information
                    accurate because it may appear in audit logs,
                    government-service workflows, approvals and
                    administration records.
                  </p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/20 text-emerald-200 text-xs font-bold">
                      {user?.role || 'Administrator'}
                    </span>

                    <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-slate-200 text-xs font-bold">
                      {adminProfile.department || 'Administration'}
                    </span>

                    <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-slate-200 text-xs font-bold">
                      {adminProfile.status || 'Active'}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* SAVE */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="save-button"
              >
                <Save className="w-4 h-4" />

                {saving
                  ? 'Saving profile...'
                  : 'Save admin profile'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* =========================================================
          PAGE STYLES
      ========================================================== */}
      <style>{`
        .profile-card {
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid #e7e5e4;
          border-radius: 1.5rem;
          padding: 1.5rem;
          box-shadow:
            0 10px 30px rgba(28, 25, 23, 0.04),
            0 2px 8px rgba(28, 25, 23, 0.025);
        }

        @media (min-width: 640px) {
          .profile-card {
            padding: 2rem;
          }
        }

        .profile-section-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding-bottom: 1.25rem;
          margin-bottom: 1.25rem;
          border-bottom: 1px solid #f0efed;
        }

        .profile-icon {
          width: 2.75rem;
          height: 2.75rem;
          border-radius: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .farmer-icon {
          background: #ecfdf5;
          color: #059669;
        }

        .admin-icon {
          background: #eff6ff;
          color: #2563eb;
        }

        .profile-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #1c1917;
        }

        .profile-subtitle {
          font-size: 0.875rem;
          color: #78716c;
          margin-top: 0.25rem;
          line-height: 1.5;
        }

        .profile-grid {
          display: grid;
          grid-template-columns: repeat(1, minmax(0, 1fr));
          gap: 1.15rem;
        }

        @media (min-width: 768px) {
          .profile-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        .field-label {
          display: block;
          font-size: 0.82rem;
          font-weight: 750;
          color: #44403c;
          margin-bottom: 0.45rem;
        }

        .form-input {
          width: 100%;
          min-height: 3rem;
          border: 1px solid #e7e5e4;
          border-radius: 0.85rem;
          background: #fafaf9;
          padding: 0.75rem 0.9rem;
          color: #292524;
          outline: none;
          transition: all 0.18s ease;
          font-size: 0.92rem;
        }

        .form-input:hover {
          border-color: #d6d3d1;
          background: white;
        }

        .form-input:focus {
          background: white;
          border-color: #10b981;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.10);
        }

        .readonly-field {
          min-height: 3rem;
          display: flex;
          align-items: center;
          gap: 0.7rem;
          width: 100%;
          border: 1px solid #e7e5e4;
          border-radius: 0.85rem;
          background: #f5f5f4;
          padding: 0.75rem 0.9rem;
          color: #57534e;
          font-size: 0.9rem;
        }

        .field-icon {
          position: absolute;
          left: 0.9rem;
          top: 50%;
          transform: translateY(-50%);
          width: 1rem;
          height: 1rem;
          color: #a8a29e;
          pointer-events: none;
        }

        .save-button {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          padding: 0.85rem 1.25rem;
          border-radius: 0.85rem;
          background: #059669;
          color: white;
          font-weight: 800;
          box-shadow: 0 8px 20px rgba(5, 150, 105, 0.20);
          transition: all 0.18s ease;
        }

        .save-button:hover:not(:disabled) {
          background: #047857;
          transform: translateY(-1px);
          box-shadow: 0 10px 25px rgba(5, 150, 105, 0.25);
        }

        .save-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

/* ===============================================================
   REUSABLE INPUT
================================================================ */

interface ProfileInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  placeholder?: string;
  required?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
}

const ProfileInput: React.FC<ProfileInputProps> = ({
  label,
  value,
  onChange,
  icon,
  placeholder,
  required,
  inputMode,
  maxLength,
}) => {
  return (
    <div>
      <label className="field-label">
        {label}
        {required && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>

      <div className="relative">
        {icon && (
          <span className="field-icon">
            {React.isValidElement<{ className?: string }>(icon)
              ? React.cloneElement(icon, {
                  className: [icon.props.className, 'w-4 h-4'].filter(Boolean).join(' '),
                })
              : icon}
          </span>
        )}

        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`form-input ${icon ? 'pl-10' : ''}`}
          placeholder={placeholder}
          required={required}
          inputMode={inputMode}
          maxLength={maxLength}
        />
      </div>
    </div>
  );
};

/* ===============================================================
   REUSABLE SELECT
================================================================ */

interface SelectInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
}

const SelectInput: React.FC<SelectInputProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
}) => {
  return (
    <div>
      <label className="field-label">
        {label}
        {required && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="form-input appearance-none pr-10"
          required={required}
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}

          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
      </div>
    </div>
  );
};