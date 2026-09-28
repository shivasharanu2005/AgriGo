import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import {
  readRegistrationSuccess,
  persistRegistrationSuccess,
} from '../lib/registrationStorage.ts';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  FileBadge2,
  Globe2,
  GraduationCap,
  Info,
  KeyRound,
  Leaf,
  Lock,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShieldCheck,
  Sprout,
  Tractor,
  User,
  Users,
  Waves,
  Wheat,
  BriefcaseBusiness,
  CircleHelp,
  AlertCircle,
  Loader2,
} from 'lucide-react';

type Role = 'FARMER' | 'OFFICER';

interface RegistrationPageProps {
  onNavigateToLogin: () => void;
}

interface FormData {
  role: Role;

  // Common
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  state: string;
  district: string;
  taluk: string;
  village: string;
  language: string;

  // Farmer
  farmerId: string;
  farmSize: string;
  landStatus: string;
  mainCrop: string;
  irrigationSource: string;
  farmingExperience: string;
  soilType: string;

  // Officer
  employeeId: string;
  department: string;
  designation: string;
  officeName: string;
  officeLocation: string;
  jurisdiction: string;
  officialEmail: string;
}

const initialForm: FormData = {
  role: 'FARMER',

  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  state: '',
  district: '',
  taluk: '',
  village: '',
  language: 'English',

  farmerId: '',
  farmSize: '',
  landStatus: '',
  mainCrop: '',
  irrigationSource: '',
  farmingExperience: '',
  soilType: '',

  employeeId: '',
  department: '',
  designation: '',
  officeName: '',
  officeLocation: '',
  jurisdiction: '',
  officialEmail: '',
};

const STEPS = [
  { number: 1, title: 'Account Type', short: 'Role' },
  { number: 2, title: 'Identity', short: 'Identity' },
  { number: 3, title: 'Profile', short: 'Profile' },
  { number: 4, title: 'Security', short: 'Security' },
  { number: 5, title: 'Confirm', short: 'Confirm' },
];

const indianStates = [
  'Karnataka',
  'Andhra Pradesh',
  'Telangana',
  'Tamil Nadu',
  'Maharashtra',
  'Kerala',
  'Goa',
  'Gujarat',
  'Madhya Pradesh',
  'Rajasthan',
  'Odisha',
  'West Bengal',
  'Uttar Pradesh',
  'Bihar',
  'Punjab',
  'Haryana',
  'Other',
];

const crops = [
  'Rice',
  'Maize',
  'Wheat',
  'Cotton',
  'Groundnut',
  'Tomato',
  'Onion',
  'Chickpea',
  'Sugarcane',
  'Millets',
  'Pulses',
  'Vegetables',
  'Fruits',
  'Other',
];

const languages = ['English', 'Kannada', 'Hindi', 'Telugu', 'Tamil', 'Marathi'];

interface InputProps {
  label: string;
  icon: React.ElementType;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
}

const Input: React.FC<InputProps> = ({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = true,
  maxLength,
}) => (
  <div className="field">
    <label>
      {label}
      {required && <span>*</span>}
    </label>
    <div className="input-shell">
      <Icon size={18} />
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        autoComplete="off"
      />
    </div>
  </div>
);

interface SelectProps {
  label: string;
  icon: React.ElementType;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  required?: boolean;
}

const Select: React.FC<SelectProps> = ({
  label,
  icon: Icon,
  value,
  onChange,
  options,
  placeholder,
  required = true,
}) => (
  <div className="field">
    <label>
      {label}
      {required && <span>*</span>}
    </label>
    <div className="input-shell select-shell">
      <Icon size={18} />
      <select value={value} onChange={(event) => onChange(event.target.value)} required={required}>
        <option value="">{placeholder}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <ChevronDown size={16} />
    </div>
  </div>
);

export const RegistrationPage: React.FC<RegistrationPageProps> = ({
  onNavigateToLogin,
}) => {
  const { register } = useAuth();

  const [formData, setFormData] = useState<FormData>(initialForm);
  const [step, setStep] = useState(1);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [dataConsent, setDataConsent] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const stored = readRegistrationSuccess();
    if (stored && stored.name) {
      setSuccess(`Congratulations, ${stored.name}! You are signed in and your account has been saved successfully.`);
    }
  }, []);

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((previous) => ({
      ...previous,
      [key]: value,
    }));

    if (error) setError('');
  };

  const passwordRules = useMemo(
    () => ({
      length: formData.password.length >= 8,
      uppercase: /[A-Z]/.test(formData.password),
      lowercase: /[a-z]/.test(formData.password),
      number: /\d/.test(formData.password),
      special: /[^A-Za-z0-9]/.test(formData.password),
    }),
    [formData.password]
  );

  const passwordScore = Object.values(passwordRules).filter(Boolean).length;

  const passwordLabel =
    passwordScore <= 2
      ? 'Weak'
      : passwordScore === 3
        ? 'Fair'
        : passwordScore === 4
          ? 'Strong'
          : 'Very Strong';

  const passwordProgress = Math.min((passwordScore / 5) * 100, 100);

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  const validateStep = (currentStep: number): string => {
    if (currentStep === 1) {
      if (!formData.role) {
        return 'Please select an account type.';
      }
    }

    if (currentStep === 2) {
      if (!formData.name.trim()) return 'Full name is required.';

      if (
        !formData.email.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      ) {
        return 'Enter a valid email address.';
      }

      if (!/^[6-9]\d{9}$/.test(formData.phone)) {
        return 'Enter a valid 10-digit Indian mobile number.';
      }

      if (!formData.state) return 'Please select your state.';
      if (!formData.district.trim()) return 'District is required.';
      if (!formData.taluk.trim()) return 'Taluk is required.';

      if (formData.role === 'FARMER' && !formData.village.trim()) {
        return 'Village is required for farmer registration.';
      }
    }

    if (currentStep === 3) {
      if (formData.role === 'FARMER') {
        if (!formData.farmSize) return 'Please enter your approximate farm size.';
        if (!formData.landStatus) return 'Please select your land status.';
        if (!formData.mainCrop) return 'Please select your primary crop.';
        if (!formData.irrigationSource) {
          return 'Please select your main irrigation source.';
        }
      }

      if (formData.role === 'OFFICER') {
        if (!formData.employeeId.trim()) {
          return 'Department employee/official ID is required.';
        }

        if (!formData.department) {
          return 'Please select your department.';
        }

        if (!formData.designation.trim()) {
          return 'Designation is required.';
        }

        if (!formData.officeName.trim()) {
          return 'Office/institution name is required.';
        }

        if (!formData.jurisdiction.trim()) {
          return 'Please enter your service jurisdiction.';
        }
      }
    }

    if (currentStep === 4) {
      if (passwordScore < 4) {
        return 'Create a stronger password using at least 8 characters, uppercase, lowercase, number and special character.';
      }

      if (formData.password !== formData.confirmPassword) {
        return 'Passwords do not match.';
      }
    }

    if (currentStep === 5) {
      if (!acceptTerms) {
        return 'You must accept the Terms of Service.';
      }

      if (!dataConsent) {
        return 'Please provide consent for secure storage and processing of registration data.';
      }
    }

    return '';
  };

  const nextStep = () => {
    setError('');

    const validationError = validateStep(step);

    if (validationError) {
      setError(validationError);
      return;
    }

    setStep((previous) => Math.min(previous + 1, STEPS.length));
  };

  const previousStep = () => {
    setError('');
    setStep((previous) => Math.max(previous - 1, 1));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    const validationError = validateStep(5);

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      /*
       * Important:
       * Keep registration API-driven.
       * Passwords should be hashed by the backend.
       * Do NOT store raw passwords in localStorage or frontend databases.
       *
       * The existing AuthContext.register() method is preserved here.
       */

      const result = await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        role: formData.role,

        state: formData.state.trim(),
        district: formData.district.trim(),
        taluk: formData.taluk.trim(),
        village: formData.village.trim(),

        language:
          formData.language === 'Kannada'
            ? 'kn'
            : formData.language === 'Hindi'
              ? 'hi'
              : 'en',

        /*
         * These fields are useful when your backend register
         * endpoint is expanded to store the complete profile.
         */
        farmerId: formData.farmerId.trim(),
        farmSize: formData.farmSize,
        landStatus: formData.landStatus,
        mainCrop: formData.mainCrop,
        irrigationSource: formData.irrigationSource,
        farmingExperience: formData.farmingExperience,
        soilType: formData.soilType,

        employeeId: formData.employeeId.trim(),
        department: formData.department,
        designation: formData.designation.trim(),
        officeName: formData.officeName.trim(),
        officeLocation: formData.officeLocation.trim(),
        jurisdiction: formData.jurisdiction.trim(),
        officialEmail: formData.officialEmail.trim().toLowerCase(),
      } as any);

      if (!result.success) {
        setError(result.error || 'Unable to create your account.');
        return;
      }

      const signedInUser = {
        id: result?.user?.id || 'new-user',
        name: result?.user?.name || formData.name.trim(),
        email: result?.user?.email || formData.email.trim().toLowerCase(),
      };

      const persisted = persistRegistrationSuccess(signedInUser);
      setSuccess(
        formData.role === 'OFFICER'
          ? `Congratulations, ${persisted.name}! You are signed in and your officer account has been saved successfully.`
          : `Congratulations, ${persisted.name}! You are signed in and your AgriGo account has been saved successfully.`
      );
    } catch (registrationError) {
      console.error(registrationError);

      setError(
        'Registration service is temporarily unavailable. Please check your backend connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        * {
          box- sizing: border-box;
        }

        .agrigo-register {
          min - height: 100vh;
        background:
        radial-gradient(circle at 10% 10%, rgba(34,197,94,.10), transparent 28%),
        radial-gradient(circle at 90% 90%, rgba(16,185,129,.09), transparent 28%),
        #f5f8f4;
        color: #17231b;
        font-family:
        Inter, ui-sans-serif, system-ui, -apple-system,
        BlinkMacSystemFont, "Segoe UI", sans-serif;
        display: flex;
        position: relative;
        overflow: hidden;
        }

        .ambient {
          position: absolute;
        border-radius: 999px;
        filter: blur(1px);
        pointer-events: none;
        }

        .ambient.one {
          width: 320px;
        height: 320px;
        background: rgba(34,197,94,.08);
        top: -120px;
        left: -80px;
        }

        .ambient.two {
          width: 280px;
        height: 280px;
        background: rgba(16,185,129,.07);
        bottom: -120px;
        right: -80px;
        }

        .register-left {
          width: 39%;
        min-height: 100vh;
        position: relative;
        overflow: hidden;
        color: white;
        padding: 48px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        background:
        linear-gradient(145deg, rgba(5,46,22,.96), rgba(6,78,44,.94)),
        #064e3b;
        }

        .register-left:after {
          content: "";
        position: absolute;
        width: 560px;
        height: 560px;
        border: 1px solid rgba(255,255,255,.10);
        border-radius: 50%;
        right: -300px;
        bottom: -180px;
        }

        .brand {
          position: relative;
        z-index: 2;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 25px;
        font-weight: 900;
        letter-spacing: -.6px;
        }

        .brand-icon {
          width: 44px;
        height: 44px;
        border-radius: 14px;
        display: grid;
        place-items: center;
        background: rgba(255,255,255,.11);
        border: 1px solid rgba(255,255,255,.15);
        color: #86efac;
        }

        .hero-copy {
          position: relative;
        z-index: 2;
        max-width: 520px;
        }

        .hero-badge {
          display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 8px 12px;
        border-radius: 999px;
        background: rgba(255,255,255,.09);
        border: 1px solid rgba(255,255,255,.13);
        color: #bbf7d0;
        font-size: 12px;
        font-weight: 800;
        margin-bottom: 22px;
        }

        .hero-copy h1 {
          margin: 0;
        font-size: clamp(38px, 4vw, 62px);
        line-height: .98;
        letter-spacing: -2.5px;
        }

        .hero-copy h1 em {
          color: #86efac;
        font-style: normal;
        }

        .hero-copy p {
          color: #d1fae5;
        font-size: 16px;
        line-height: 1.7;
        margin: 24px 0 32px;
        max-width: 500px;
        }

        .trust-grid {
          display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        }

        .trust-card {
          padding: 15px;
        border: 1px solid rgba(255,255,255,.11);
        background: rgba(255,255,255,.055);
        border-radius: 17px;
        backdrop-filter: blur(10px);
        }

        .trust-card svg {
          color: #86efac;
        margin-bottom: 8px;
        }

        .trust-card strong {
          display: block;
        font-size: 13px;
        }

        .trust-card span {
          display: block;
        color: #a7f3d0;
        font-size: 11px;
        margin-top: 4px;
        line-height: 1.45;
        }

        .left-footer {
          position: relative;
        z-index: 2;
        color: rgba(236,253,245,.68);
        font-size: 12px;
        }

        .register-right {
          width: 61%;
        min-height: 100vh;
        padding: 28px 5%;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow-y: auto;
        }

        .register-card {
          width: 100%;
        max-width: 790px;
        background: rgba(255,255,255,.92);
        border: 1px solid rgba(20,83,45,.10);
        border-radius: 30px;
        box-shadow:
        0 30px 80px rgba(15, 55, 30, .11),
        0 5px 18px rgba(15, 55, 30, .06);
        padding: 32px;
        backdrop-filter: blur(18px);
        }

        .top-row {
          display: flex;
        justify-content: space-between;
        gap: 20px;
        align-items: flex-start;
        margin-bottom: 26px;
        }

        .eyebrow {
          display: flex;
        align-items: center;
        gap: 8px;
        color: #15803d;
        font-size: 12px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 7px;
        }

        .top-row h2 {
          margin: 0;
        font-size: 30px;
        letter-spacing: -1px;
        color: #17231b;
        }

        .top-row p {
          color: #647067;
        margin: 7px 0 0;
        font-size: 13px;
        }

        .login-link {
          white - space: nowrap;
        border: 0;
        background: transparent;
        color: #15803d;
        font-weight: 800;
        cursor: pointer;
        font-size: 13px;
        }

        .stepper {
          position: relative;
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 5px;
        margin-bottom: 30px;
        }

        .step-line {
          position: absolute;
        left: 9%;
        right: 9%;
        top: 17px;
        height: 2px;
        background: #e5ebe6;
        z-index: 0;
        }

        .step-progress {
          position: absolute;
        left: 9%;
        top: 17px;
        height: 2px;
        background: #16a34a;
        z-index: 1;
        transition: width .35s ease;
        }

        .step-item {
          position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 7px;
        font-size: 10px;
        color: #849087;
        font-weight: 700;
        }

        .step-circle {
          width: 35px;
        height: 35px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: white;
        border: 2px solid #dce4de;
        color: #839087;
        transition: .3s;
        }

        .step-item.active .step-circle {
          border - color: #16a34a;
        background: #16a34a;
        color: white;
        box-shadow: 0 0 0 6px rgba(22,163,74,.09);
        }

        .step-item.completed .step-circle {
          border - color: #16a34a;
        color: #16a34a;
        background: #ecfdf5;
        }

        .step-item.active,
        .step-item.completed {
          color: #166534;
        }

        .role-grid {
          display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        margin-bottom: 24px;
        }

        .role-card {
          border: 2px solid #e2e9e3;
        background: #fbfdfb;
        border-radius: 22px;
        padding: 20px;
        cursor: pointer;
        transition: .25s ease;
        position: relative;
        }

        .role-card:hover {
          transform: translateY(-2px);
        border-color: #86efac;
        }

        .role-card.selected {
          border - color: #16a34a;
        background: linear-gradient(145deg, #f0fdf4, #ffffff);
        box-shadow: 0 12px 28px rgba(22,163,74,.10);
        }

        .role-check {
          position: absolute;
        right: 13px;
        top: 13px;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: #16a34a;
        color: white;
        }

        .role-icon {
          width: 48px;
        height: 48px;
        display: grid;
        place-items: center;
        border-radius: 15px;
        background: #ecfdf5;
        color: #15803d;
        margin-bottom: 14px;
        }

        .role-card h3 {
          margin: 0 0 5px;
        font-size: 16px;
        }

        .role-card p {
          margin: 0;
        color: #6b766e;
        line-height: 1.55;
        font-size: 12px;
        }

        .role-points {
          display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 13px;
        }

        .role-points span {
          padding: 5px 8px;
        border-radius: 999px;
        background: #f0fdf4;
        color: #166534;
        font-size: 10px;
        font-weight: 800;
        }

        .section-heading {
          display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 17px;
        }

        .section-heading h3 {
          margin: 0;
        font-size: 17px;
        }

        .section-heading p {
          margin: 4px 0 0;
        color: #748078;
        font-size: 12px;
        }

        .field-grid {
          display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 17px;
        }

        .field.full {
          grid - column: 1 / -1;
        }

        .field label {
          display: block;
        margin-bottom: 7px;
        font-size: 12px;
        font-weight: 850;
        color: #354039;
        }

        .field label span {
          color: #dc2626;
        margin-left: 3px;
        }

        .input-shell {
          min - height: 47px;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 0 13px;
        background: #f7faf7;
        border: 1px solid #dfe7e1;
        border-radius: 14px;
        transition: .2s;
        }

        .input-shell:focus-within {
          background: white;
        border-color: #22c55e;
        box-shadow: 0 0 0 4px rgba(34,197,94,.09);
        }

        .input-shell svg {
          color: #8b978e;
        flex: 0 0 auto;
        }

        .input-shell input,
        .input-shell select {
          border: 0;
        outline: 0;
        background: transparent;
        width: 100%;
        min-width: 0;
        color: #18221b;
        font-size: 13px;
        font-family: inherit;
        }

        .input-shell input::placeholder {
          color: #a1aaa3;
        }

        .input-shell select {
          appearance: none;
        cursor: pointer;
        }

        .select-shell > svg:last-child {
          margin - left: auto;
        }

        .password-wrap {
          position: relative;
        }

        .password-wrap .input-shell {
          padding - right: 45px;
        }

        .eye-button {
          position: absolute;
        right: 11px;
        top: 50%;
        transform: translateY(-50%);
        border: 0;
        background: transparent;
        color: #7d8980;
        cursor: pointer;
        padding: 5px;
        }

        .password-meter {
          margin - top: 9px;
        }

        .meter-track {
          height: 5px;
        border-radius: 999px;
        background: #e7ece8;
        overflow: hidden;
        }

        .meter-fill {
          height: 100%;
        border-radius: inherit;
        background: #16a34a;
        transition: width .25s ease;
        }

        .meter-meta {
          display: flex;
        justify-content: space-between;
        margin-top: 5px;
        font-size: 10px;
        color: #738078;
        font-weight: 700;
        }

        .password-rules {
          display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 7px;
        margin-top: 13px;
        padding: 12px;
        background: #f8faf8;
        border-radius: 13px;
        border: 1px solid #e8eee9;
        }

        .password-rule {
          display: flex;
        align-items: center;
        gap: 6px;
        color: #8a948d;
        font-size: 10px;
        font-weight: 700;
        }

        .password-rule.ok {
          color: #15803d;
        }

        .password-rule svg {
          width: 13px;
        height: 13px;
        }

        .info-box {
          display: flex;
        gap: 10px;
        align-items: flex-start;
        padding: 13px;
        border-radius: 14px;
        background: #eff6ff;
        border: 1px solid #dbeafe;
        color: #1e40af;
        margin-bottom: 18px;
        font-size: 11px;
        line-height: 1.55;
        }

        .info-box svg {
          flex: 0 0 auto;
        margin-top: 1px;
        }

        .consent-area {
          display: grid;
        gap: 11px;
        margin-top: 20px;
        }

        .consent {
          display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 13px;
        border-radius: 14px;
        background: #fafcfb;
        border: 1px solid #e5ebe6;
        cursor: pointer;
        }

        .consent input {
          width: 17px;
        height: 17px;
        accent-color: #16a34a;
        margin-top: 1px;
        }

        .consent span {
          font - size: 11px;
        line-height: 1.55;
        color: #59655d;
        }

        .consent strong {
          color: #263129;
        }

        .error-box,
        .success-box {
          display: flex;
        gap: 10px;
        align-items: flex-start;
        padding: 13px 15px;
        border-radius: 14px;
        margin-bottom: 20px;
        font-size: 12px;
        line-height: 1.5;
        }

        .error-box {
          background: #fef2f2;
        border: 1px solid #fecaca;
        color: #b91c1c;
        }

        .success-box {
          background: #ecfdf5;
        border: 1px solid #bbf7d0;
        color: #166534;
        }

        .success-box button {
          border: 0;
        background: transparent;
        color: #15803d;
        text-decoration: underline;
        font-weight: 900;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
        white-space: nowrap;
        }

        .action-row {
          display: flex;
        gap: 11px;
        margin-top: 27px;
        padding-top: 21px;
        border-top: 1px solid #edf1ed;
        }

        .back-button,
        .next-button,
        .submit-button {
          min - height: 48px;
        border-radius: 14px;
        font-family: inherit;
        font-weight: 850;
        cursor: pointer;
        transition: .2s;
        }

        .back-button {
          padding: 0 18px;
        border: 1px solid #dce4de;
        background: white;
        color: #556159;
        }

        .back-button:hover {
          background: #f5f8f5;
        }

        .next-button,
        .submit-button {
          flex: 1;
        border: 0;
        color: white;
        background: linear-gradient(135deg, #15803d, #16a34a);
        box-shadow: 0 9px 22px rgba(22,163,74,.20);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        }

        .next-button:hover,
        .submit-button:hover {
          transform: translateY(-1px);
        box-shadow: 0 12px 27px rgba(22,163,74,.25);
        }

        .next-button:disabled,
        .submit-button:disabled {
          opacity: .65;
        cursor: not-allowed;
        transform: none;
        }

        .review-grid {
          display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        }

        .review-item {
          padding: 13px;
        background: #f8faf8;
        border: 1px solid #e7ece8;
        border-radius: 13px;
        }

        .review-item small {
          display: block;
        color: #8a958d;
        font-size: 9px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: .7px;
        margin-bottom: 5px;
        }

        .review-item strong {
          display: block;
        color: #263129;
        font-size: 12px;
        word-break: break-word;
        }

        .verification-card {
          margin - top: 18px;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 15px;
        background: linear-gradient(135deg, #f0fdf4, #f8fffa);
        border: 1px solid #bbf7d0;
        border-radius: 15px;
        }

        .verification-icon {
          width: 39px;
        height: 39px;
        border-radius: 12px;
        display: grid;
        place-items: center;
        background: #dcfce7;
        color: #15803d;
        flex: 0 0 auto;
        }

        .verification-card strong {
          font - size: 12px;
        display: block;
        }

        .verification-card span {
          display: block;
        margin-top: 3px;
        color: #607067;
        font-size: 10px;
        line-height: 1.45;
        }

        .footer-note {
          display: flex;
        justify-content: center;
        align-items: center;
        gap: 6px;
        color: #7b857e;
        font-size: 10px;
        margin-top: 16px;
        }

        .success-state {
          text - align: center;
        padding: 30px 10px 20px;
        }

        .success-icon {
          width: 80px;
        height: 80px;
        border-radius: 50%;
        margin: 0 auto 20px;
        display: grid;
        place-items: center;
        background: #dcfce7;
        color: #15803d;
        box-shadow: 0 0 0 12px #f0fdf4;
        }

        .success-state h2 {
          font - size: 25px;
        margin: 0 0 9px;
        }

        .success-state p {
          max - width: 510px;
        margin: 0 auto 23px;
        color: #657069;
        font-size: 13px;
        line-height: 1.7;
        }

        .continue-button {
          min - height: 47px;
        padding: 0 22px;
        border: 0;
        border-radius: 13px;
        color: white;
        background: #15803d;
        font-weight: 850;
        cursor: pointer;
        }

        @media (max-width: 1050px) {
          .register - left {
          width: 34%;
        padding: 35px;
          }

        .register-right {
          width: 66%;
        padding: 22px;
          }

        .hero-copy h1 {
          font - size: 40px;
          }
        }

        @media (max-width: 820px) {
          .agrigo - register {
          display: block;
        overflow: auto;
          }

        .register-left {
          width: 100%;
        min-height: auto;
        padding: 27px 22px;
          }

        .hero-copy {
          margin - top: 40px;
          }

        .hero-copy h1 {
          font - size: 38px;
          }

        .trust-grid {
          display: none;
          }

        .left-footer {
          margin - top: 35px;
          }

        .register-right {
          width: 100%;
        min-height: auto;
        padding: 16px;
        display: block;
          }

        .register-card {
          border - radius: 22px;
        padding: 22px 18px;
          }
        }

        @media (max-width: 600px) {
          .top - row {
          display: block;
          }

        .login-link {
          margin - top: 12px;
          }

        .top-row h2 {
          font - size: 25px;
          }

        .role-grid,
        .field-grid,
        .review-grid {
          grid - template - columns: 1fr;
          }

        .field.full {
          grid - column: auto;
          }

        .password-rules {
          grid - template - columns: 1fr;
          }

        .step-item span:last-child {
          display: none;
          }

        .action-row {
          flex - direction: column-reverse;
          }

        .back-button {
          width: 100%;
          }
        }
      `}</style>

      <div className="agrigo-register">
        <div className="ambient one" />
        <div className="ambient two" />

        {/* LEFT BRAND EXPERIENCE */}
        <aside className="register-left">
          <div>
            <div className="brand">
              <div className="brand-icon">
                <img src="/assets/AgriGo%20logo.png" alt="AgriGo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
              AgriGo
            </div>

            <div className="hero-copy">
              <div className="hero-badge">
                <ShieldCheck size={14} />
                Secure agricultural identity platform
              </div>

              <h1>
                Your farm.
                <br />
                Your <em>digital</em>
                <br />
                identity.
              </h1>

              <p>
                Build your AgriGo profile once and connect your agricultural
                services, farm records, advisories, schemes, market
                information and department support from one secure account.
              </p>

              <div className="trust-grid">
                <div className="trust-card">
                  <Shield size={19} />
                  <strong>Secure Account</strong>
                  <span>Authentication-ready architecture</span>
                </div>

                <div className="trust-card">
                  <Wheat size={19} />
                  <strong>Farm Profile</strong>
                  <span>Personalized agricultural services</span>
                </div>

                <div className="trust-card">
                  <Users size={19} />
                  <strong>Role Based</strong>
                  <span>Separate farmer & officer workflows</span>
                </div>

                <div className="trust-card">
                  <Globe2 size={19} />
                  <strong>Regional Ready</strong>
                  <span>Designed for Indian agriculture</span>
                </div>
              </div>
            </div>
          </div>

          <div className="left-footer">
            © {new Date().getFullYear()} AgriGo · Smart Digital Agriculture
            Platform
          </div>
        </aside>

        {/* RIGHT REGISTRATION */}
        <main className="register-right">
          <section className="register-card">
            <div className="top-row">
              <div>
                <div className="eyebrow">
                  <Leaf size={14} />
                  New account
                </div>

                <h2>Create your AgriGo account</h2>

                <p>
                  Complete your profile in a few secure steps.
                </p>
              </div>

              <button
                type="button"
                className="login-link"
                onClick={onNavigateToLogin}
              >
                Already registered? Login
              </button>
            </div>

            {!success && (
              <div className="stepper">
                <div className="step-line" />

                <div
                  className="step-progress"
                  style={{ width: `${Math.max(progress - 18, 0)}%` }}
                />

                {STEPS.map((item) => {
                  const active = step === item.number;
                  const completed = step > item.number;

                  return (
                    <div
                      key={item.number}
                      className={`step-item ${active ? 'active' : ''
                        } ${completed ? 'completed' : ''}`}
                    >
                      <div className="step-circle">
                        {completed ? (
                          <Check size={16} strokeWidth={3} />
                        ) : (
                          item.number
                        )}
                      </div>

                      <span>{item.title}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {error && (
              <div className="error-box">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {success ? (
              <div className="success-state">
                <div className="success-icon">
                  <CheckCircle2 size={40} />
                </div>

                <h2>
                  {formData.role === 'OFFICER'
                    ? 'Registration Submitted'
                    : 'Welcome to AgriGo'}
                </h2>

                <p>{success}</p>

                {formData.role === 'OFFICER' && (
                  <div className="verification-card">
                    <div className="verification-icon">
                      <BadgeCheck size={21} />
                    </div>

                    <div style={{ textAlign: 'left' }}>
                      <strong>Department verification</strong>
                      <span>
                        Agriculture department accounts can be placed into a
                        verification workflow before privileged officer
                        features are enabled.
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  className="continue-button"
                  onClick={onNavigateToLogin}
                >
                  Continue to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* STEP 1 */}
                {step === 1 && (
                  <>
                    <div className="section-heading">
                      <div>
                        <h3>Choose your account type</h3>
                        <p>
                          Your selection controls your dashboard and access
                          permissions.
                        </p>
                      </div>
                    </div>

                    <div className="role-grid">
                      <div
                        className={`role-card ${formData.role === 'FARMER' ? 'selected' : ''
                          }`}
                        onClick={() => update('role', 'FARMER')}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            update('role', 'FARMER');
                          }
                        }}
                      >
                        {formData.role === 'FARMER' && (
                          <div className="role-check">
                            <Check size={13} />
                          </div>
                        )}

                        <div className="role-icon">
                          <Tractor size={24} />
                        </div>

                        <h3>Farmer</h3>

                        <p>
                          For farmers who want personalized crop, farm,
                          market, irrigation, scheme and advisory services.
                        </p>

                        <div className="role-points">
                          <span>Farm Profile</span>
                          <span>Crop Advisory</span>
                          <span>Market</span>
                        </div>
                      </div>

                      <div
                        className={`role-card ${formData.role === 'OFFICER' ? 'selected' : ''
                          }`}
                        onClick={() => update('role', 'OFFICER')}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            update('role', 'OFFICER');
                          }
                        }}
                      >
                        {formData.role === 'OFFICER' && (
                          <div className="role-check">
                            <Check size={13} />
                          </div>
                        )}

                        <div className="role-icon">
                          <BriefcaseBusiness size={24} />
                        </div>

                        <h3>Agriculture Department</h3>

                        <p>
                          For authorized agriculture personnel, officers and
                          departmental staff working within a defined
                          jurisdiction.
                        </p>

                        <div className="role-points">
                          <span>Officer Console</span>
                          <span>Farmer Support</span>
                          <span>Verification</span>
                        </div>
                      </div>
                    </div>

                    <div className="info-box">
                      <Info size={17} />
                      <span>
                        Select the role that represents your actual account.
                        AgriGo should enforce permissions on the backend;
                        changing a frontend selection must never grant
                        additional privileges.
                      </span>
                    </div>
                  </>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <>
                    <div className="section-heading">
                      <div>
                        <h3>Identity & location</h3>
                        <p>
                          This information helps AgriGo provide location-aware
                          agricultural services.
                        </p>
                      </div>
                    </div>

                    <div className="field-grid">
                      <Input
                        label="Full Name"
                        icon={User}
                        value={formData.name}
                        onChange={(value) => update('name', value)}
                        placeholder={
                          formData.role === 'FARMER'
                            ? 'Enter your full name'
                            : 'Enter official name'
                        }
                      />

                      <Input
                        label="Mobile Number"
                        icon={Phone}
                        value={formData.phone}
                        onChange={(value) =>
                          update(
                            'phone',
                            value.replace(/\D/g, '').slice(0, 10)
                          )
                        }
                        placeholder="10-digit mobile number"
                        type="tel"
                        maxLength={10}
                      />

                      <Input
                        label="Email Address"
                        icon={Mail}
                        value={formData.email}
                        onChange={(value) => update('email', value)}
                        placeholder="yourname@example.com"
                        type="email"
                      />

                      <Select
                        label="Preferred Language"
                        icon={Globe2}
                        value={formData.language}
                        onChange={(value) => update('language', value)}
                        options={languages}
                        placeholder="Choose language"
                      />

                      <Select
                        label="State"
                        icon={MapPin}
                        value={formData.state}
                        onChange={(value) => update('state', value)}
                        options={indianStates}
                        placeholder="Select state"
                      />

                      <Input
                        label="District"
                        icon={Building2}
                        value={formData.district}
                        onChange={(value) => update('district', value)}
                        placeholder="e.g. Kolar"
                      />

                      <Input
                        label="Taluk"
                        icon={MapPin}
                        value={formData.taluk}
                        onChange={(value) => update('taluk', value)}
                        placeholder="e.g. Srinivaspur"
                      />

                      {formData.role === 'FARMER' ? (
                        <Input
                          label="Village"
                          icon={MapPin}
                          value={formData.village}
                          onChange={(value) => update('village', value)}
                          placeholder="Enter village"
                        />
                      ) : (
                        <Input
                          label="Office Location"
                          icon={Building2}
                          value={formData.officeLocation}
                          onChange={(value) =>
                            update('officeLocation', value)
                          }
                          placeholder="Office location"
                        />
                      )}
                    </div>
                  </>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                  <>
                    {formData.role === 'FARMER' ? (
                      <>
                        <div className="section-heading">
                          <div>
                            <h3>Your farming profile</h3>
                            <p>
                              These details improve crop, irrigation and
                              advisory personalization.
                            </p>
                          </div>
                        </div>

                        <div className="field-grid">
                          <Input
                            label="Farmer ID / Registration ID"
                            icon={FileBadge2}
                            value={formData.farmerId}
                            onChange={(value) =>
                              update('farmerId', value)
                            }
                            placeholder="Optional government/farmer ID"
                            required={false}
                          />

                          <Select
                            label="Farm Size"
                            icon={Wheat}
                            value={formData.farmSize}
                            onChange={(value) =>
                              update('farmSize', value)
                            }
                            options={[
                              '< 1 acre',
                              '1–2 acres',
                              '2–5 acres',
                              '5–10 acres',
                              '10–25 acres',
                              '25+ acres',
                            ]}
                            placeholder="Select farm size"
                          />

                          <Select
                            label="Land Status"
                            icon={FileBadge2}
                            value={formData.landStatus}
                            onChange={(value) =>
                              update('landStatus', value)
                            }
                            options={[
                              'Owned',
                              'Leased',
                              'Shared / Family Land',
                              'Other',
                            ]}
                            placeholder="Select land status"
                          />

                          <Select
                            label="Primary Crop"
                            icon={Leaf}
                            value={formData.mainCrop}
                            onChange={(value) =>
                              update('mainCrop', value)
                            }
                            options={crops}
                            placeholder="Select primary crop"
                          />

                          <Select
                            label="Main Irrigation Source"
                            icon={Waves}
                            value={formData.irrigationSource}
                            onChange={(value) =>
                              update('irrigationSource', value)
                            }
                            options={[
                              'Rainfed',
                              'Borewell',
                              'Open Well',
                              'Canal',
                              'Farm Pond',
                              'Drip Irrigation',
                              'Sprinkler',
                              'Other',
                            ]}
                            placeholder="Select irrigation source"
                          />

                          <Select
                            label="Farming Experience"
                            icon={GraduationCap}
                            value={formData.farmingExperience}
                            onChange={(value) =>
                              update('farmingExperience', value)
                            }
                            options={[
                              'Less than 1 year',
                              '1–5 years',
                              '5–10 years',
                              '10–20 years',
                              '20+ years',
                            ]}
                            placeholder="Select experience"
                          />

                          <Select
                            label="Soil Type"
                            icon={Sprout}
                            value={formData.soilType}
                            onChange={(value) =>
                              update('soilType', value)
                            }
                            options={[
                              'Red Soil',
                              'Black Soil',
                              'Alluvial Soil',
                              'Laterite Soil',
                              'Sandy Soil',
                              'Clay Soil',
                              'Unknown',
                            ]}
                            placeholder="Select soil type"
                            required={false}
                          />
                        </div>

                        <div className="info-box" style={{ marginTop: 20 }}>
                          <CircleHelp size={17} />
                          <span>
                            You can update agricultural details later from
                            your Farm Profile. Do not enter unnecessary
                            sensitive information during registration.
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="section-heading">
                          <div>
                            <h3>Department credentials</h3>
                            <p>
                              Officer registration uses additional information
                              for departmental verification and access
                              control.
                            </p>
                          </div>
                        </div>

                        <div className="info-box">
                          <ShieldCheck size={17} />
                          <span>
                            Department registration does not automatically
                            grant administrator privileges. Your backend
                            should verify the official identity and assign
                            permissions according to your department's
                            authorization process.
                          </span>
                        </div>

                        <div className="field-grid">
                          <Input
                            label="Employee / Official ID"
                            icon={BadgeCheck}
                            value={formData.employeeId}
                            onChange={(value) =>
                              update('employeeId', value)
                            }
                            placeholder="Enter official ID"
                          />

                          <Input
                            label="Official Email"
                            icon={Mail}
                            value={formData.officialEmail}
                            onChange={(value) =>
                              update('officialEmail', value)
                            }
                            placeholder="department@organization.gov.in"
                            type="email"
                          />

                          <Select
                            label="Department"
                            icon={Building2}
                            value={formData.department}
                            onChange={(value) =>
                              update('department', value)
                            }
                            options={[
                              'Agriculture Department',
                              'Horticulture Department',
                              'Animal Husbandry',
                              'Agricultural Marketing',
                              'Rural Development',
                              'Cooperative Department',
                              'Other',
                            ]}
                            placeholder="Select department"
                          />

                          <Input
                            label="Designation"
                            icon={BriefcaseBusiness}
                            value={formData.designation}
                            onChange={(value) =>
                              update('designation', value)
                            }
                            placeholder="e.g. Agriculture Officer"
                          />

                          <Input
                            label="Office / Institution"
                            icon={Building2}
                            value={formData.officeName}
                            onChange={(value) =>
                              update('officeName', value)
                            }
                            placeholder="Enter office name"
                          />

                          <Input
                            label="Service Jurisdiction"
                            icon={MapPin}
                            value={formData.jurisdiction}
                            onChange={(value) =>
                              update('jurisdiction', value)
                            }
                            placeholder="e.g. Kolar District"
                          />
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* STEP 4 */}
                {step === 4 && (
                  <>
                    <div className="section-heading">
                      <div>
                        <h3>Secure your account</h3>
                        <p>
                          Create a password that protects your agricultural
                          records and account access.
                        </p>
                      </div>
                    </div>

                    <div className="field-grid">
                      <div className="field">
                        <label>
                          Password <span>*</span>
                        </label>

                        <div className="password-wrap">
                          <div className="input-shell">
                            <KeyRound size={18} />

                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={formData.password}
                              onChange={(event) =>
                                update('password', event.target.value)
                              }
                              placeholder="Create strong password"
                              autoComplete="new-password"
                            />
                          </div>

                          <button
                            type="button"
                            className="eye-button"
                            onClick={() =>
                              setShowPassword((value) => !value)
                            }
                            aria-label={
                              showPassword
                                ? 'Hide password'
                                : 'Show password'
                            }
                          >
                            {showPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>

                        <div className="password-meter">
                          <div className="meter-track">
                            <div
                              className="meter-fill"
                              style={{
                                width: `${passwordProgress}%`,
                              }}
                            />
                          </div>

                          <div className="meter-meta">
                            <span>Password strength</span>
                            <strong>{passwordLabel}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="field">
                        <label>
                          Confirm Password <span>*</span>
                        </label>

                        <div className="password-wrap">
                          <div className="input-shell">
                            <Lock size={18} />

                            <input
                              type={
                                showConfirmPassword
                                  ? 'text'
                                  : 'password'
                              }
                              value={formData.confirmPassword}
                              onChange={(event) =>
                                update(
                                  'confirmPassword',
                                  event.target.value
                                )
                              }
                              placeholder="Re-enter password"
                              autoComplete="new-password"
                            />
                          </div>

                          <button
                            type="button"
                            className="eye-button"
                            onClick={() =>
                              setShowConfirmPassword((value) => !value)
                            }
                            aria-label={
                              showConfirmPassword
                                ? 'Hide password'
                                : 'Show password'
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="password-rules">
                      <div
                        className={`password-rule ${passwordRules.length ? 'ok' : ''
                          }`}
                      >
                        {passwordRules.length ? (
                          <CheckCircle2 />
                        ) : (
                          <Lock />
                        )}
                        8+ characters
                      </div>

                      <div
                        className={`password-rule ${passwordRules.uppercase ? 'ok' : ''
                          }`}
                      >
                        {passwordRules.uppercase ? (
                          <CheckCircle2 />
                        ) : (
                          <Lock />
                        )}
                        Uppercase letter
                      </div>

                      <div
                        className={`password-rule ${passwordRules.lowercase ? 'ok' : ''
                          }`}
                      >
                        {passwordRules.lowercase ? (
                          <CheckCircle2 />
                        ) : (
                          <Lock />
                        )}
                        Lowercase letter
                      </div>

                      <div
                        className={`password-rule ${passwordRules.number ? 'ok' : ''
                          }`}
                      >
                        {passwordRules.number ? (
                          <CheckCircle2 />
                        ) : (
                          <Lock />
                        )}
                        Number
                      </div>

                      <div
                        className={`password-rule ${passwordRules.special ? 'ok' : ''
                          }`}
                      >
                        {passwordRules.special ? (
                          <CheckCircle2 />
                        ) : (
                          <Lock />
                        )}
                        Special character
                      </div>
                    </div>

                    <div className="verification-card">
                      <div className="verification-icon">
                        <ShieldCheck size={21} />
                      </div>

                      <div>
                        <strong>Backend security requirement</strong>
                        <span>
                          Your production backend should hash passwords using
                          a modern password-hashing algorithm and issue secure
                          authentication tokens or sessions. Never store raw
                          passwords in your database.
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* STEP 5 */}
                {step === 5 && (
                  <>
                    <div className="section-heading">
                      <div>
                        <h3>Review & create account</h3>
                        <p>
                          Check your information before sending the
                          registration request.
                        </p>
                      </div>
                    </div>

                    <div className="review-grid">
                      <div className="review-item">
                        <small>Account type</small>
                        <strong>
                          {formData.role === 'FARMER'
                            ? 'Farmer'
                            : 'Agriculture Department'}
                        </strong>
                      </div>

                      <div className="review-item">
                        <small>Name</small>
                        <strong>{formData.name}</strong>
                      </div>

                      <div className="review-item">
                        <small>Email</small>
                        <strong>{formData.email}</strong>
                      </div>

                      <div className="review-item">
                        <small>Mobile</small>
                        <strong>+91 {formData.phone}</strong>
                      </div>

                      <div className="review-item">
                        <small>Location</small>
                        <strong>
                          {formData.village
                            ? `${formData.village}, ${formData.taluk}, ${formData.district}`
                            : `${formData.taluk}, ${formData.district}`}
                        </strong>
                      </div>

                      <div className="review-item">
                        <small>State</small>
                        <strong>{formData.state}</strong>
                      </div>

                      {formData.role === 'FARMER' ? (
                        <>
                          <div className="review-item">
                            <small>Primary crop</small>
                            <strong>{formData.mainCrop}</strong>
                          </div>

                          <div className="review-item">
                            <small>Farm size</small>
                            <strong>{formData.farmSize}</strong>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="review-item">
                            <small>Employee ID</small>
                            <strong>{formData.employeeId}</strong>
                          </div>

                          <div className="review-item">
                            <small>Department</small>
                            <strong>{formData.department}</strong>
                          </div>

                          <div className="review-item">
                            <small>Designation</small>
                            <strong>{formData.designation}</strong>
                          </div>

                          <div className="review-item">
                            <small>Jurisdiction</small>
                            <strong>{formData.jurisdiction}</strong>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="consent-area">
                      <label className="consent">
                        <input
                          type="checkbox"
                          checked={acceptTerms}
                          onChange={(event) =>
                            setAcceptTerms(event.target.checked)
                          }
                        />

                        <span>
                          I agree to the <strong>AgriGo Terms of Service</strong>{' '}
                          and understand that account access is subject to
                          applicable verification and authorization rules.
                        </span>
                      </label>

                      <label className="consent">
                        <input
                          type="checkbox"
                          checked={dataConsent}
                          onChange={(event) =>
                            setDataConsent(event.target.checked)
                          }
                        />

                        <span>
                          I consent to AgriGo securely storing and processing
                          the information required to provide agricultural
                          services, personalized recommendations and account
                          management.
                        </span>
                      </label>
                    </div>

                    <div className="info-box" style={{ marginTop: 17 }}>
                      <ShieldCheck size={17} />
                      <span>
                        AgriGo should use backend authorization to enforce
                        Farmer and Department permissions. Registration alone
                        must not create unrestricted administrator access.
                      </span>
                    </div>
                  </>
                )}

                {/* ACTIONS */}
                <div className="action-row">
                  {step > 1 && (
                    <button
                      type="button"
                      className="back-button"
                      onClick={previousStep}
                      disabled={isSubmitting}
                    >
                      <ArrowLeft
                        size={16}
                        style={{ verticalAlign: 'middle', marginRight: 5 }}
                      />
                      Back
                    </button>
                  )}

                  {step < STEPS.length ? (
                    <button
                      type="button"
                      className="next-button"
                      onClick={nextStep}
                    >
                      Continue
                      <ArrowRight size={17} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="submit-button"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2
                            size={17}
                            style={{
                              animation: 'agrigo-spin 1s linear infinite',
                            }}
                          />
                          Creating secure account...
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={17} />
                          Create {formData.role === 'FARMER' ? 'Farmer' : 'Department'} Account
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            )}

            {!success && (
              <div className="footer-note">
                <Lock size={12} />
                Registration data is transmitted through your application
                authentication layer.
              </div>
            )}
          </section>
        </main>
      </div>

      <style>{`
        @keyframes agrigo-spin {
          from {transform: rotate(0deg); }
        to {transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};