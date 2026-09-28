import React, { useEffect, useState } from "react";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  UserRound,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  ChevronRight,
  Tractor,
  Sprout,
  CloudSun,
  Wheat,
  Shield,
  Satellite,
  Activity,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext.tsx";

type UserRole = "farmer" | "admin";

/* ============================================================
   AGRIGO LOGIN STYLES
   ============================================================ */

const styles = `
* {
  box-sizing: border-box;
}

html,
body,
#root {
  min-height: 100%;
  margin: 0;
  padding: 0;
}

body {
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

/* ============================================================
   MAIN PAGE
   ============================================================ */

.agrigo-login-page {
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;
  background: #091b12;
  color: #14251b;
}

/* ============================================================
   FARM BACKGROUND
   ============================================================ */

.real-farm-scene {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #15271c;
}

.farm-photo {
  position: absolute;
  inset: -4%;
  width: 108%;
  height: 108%;
  object-fit: cover;
  object-position: center center;

  animation:
    cinematicFarmZoom 18s ease-in-out infinite alternate,
    farmReveal 1.4s ease forwards;

  filter:
    saturate(1.08)
    contrast(1.04)
    brightness(0.94);
}

@keyframes cinematicFarmZoom {
  0% {
    transform: scale(1.02) translate3d(0, 0, 0);
  }

  50% {
    transform: scale(1.055) translate3d(-0.7%, -0.4%, 0);
  }

  100% {
    transform: scale(1.09) translate3d(-1.2%, -0.7%, 0);
  }
}

@keyframes farmReveal {
  from {
    opacity: 0;
    transform: scale(1.06);
  }

  to {
    opacity: 1;
    transform: scale(1.02);
  }
}

/* ============================================================
   COLOR GRADING
   ============================================================ */

.farm-color-grade {
  position: absolute;
  inset: 0;
  pointer-events: none;

  background:
    linear-gradient(
      90deg,
      rgba(5, 20, 12, 0.64) 0%,
      rgba(5, 20, 12, 0.28) 30%,
      rgba(5, 20, 12, 0.04) 58%,
      rgba(5, 20, 12, 0.22) 100%
    ),
    linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.04) 0%,
      transparent 40%,
      rgba(0, 0, 0, 0.48) 100%
    );
}

/* ============================================================
   SUNLIGHT
   ============================================================ */

.sun-light {
  position: absolute;
  width: 420px;
  height: 420px;
  left: -170px;
  top: -160px;
  border-radius: 50%;

  background:
    radial-gradient(
      circle,
      rgba(255, 238, 166, 0.34) 0%,
      rgba(255, 215, 105, 0.18) 30%,
      transparent 70%
    );

  filter: blur(10px);
  animation: sunlightPulse 7s ease-in-out infinite;
  pointer-events: none;
}

@keyframes sunlightPulse {
  0%,
  100% {
    opacity: 0.65;
    transform: scale(1);
  }

  50% {
    opacity: 0.95;
    transform: scale(1.08);
  }
}

/* ============================================================
   HORIZON
   ============================================================ */

.horizon-haze {
  position: absolute;
  left: 0;
  right: 0;
  top: 35%;
  height: 25%;

  background:
    linear-gradient(
      180deg,
      transparent,
      rgba(218, 235, 205, 0.1),
      transparent
    );

  filter: blur(18px);
  pointer-events: none;
}

/* ============================================================
   DUST
   ============================================================ */

.dust-layer {
  position: absolute;
  left: 15%;
  bottom: 25%;
  width: 38%;
  height: 35%;
  pointer-events: none;
  opacity: 0.7;
}

.dust-particle {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;

  background: rgba(225, 193, 140, 0.55);

  filter: blur(0.4px);
  animation: realisticDust 3.8s ease-out infinite;
}

.dust-particle:nth-child(1) {
  left: 10%;
  bottom: 15%;
  animation-delay: 0.2s;
}

.dust-particle:nth-child(2) {
  left: 18%;
  bottom: 23%;
  animation-delay: 0.8s;
}

.dust-particle:nth-child(3) {
  left: 28%;
  bottom: 10%;
  animation-delay: 1.4s;
}

.dust-particle:nth-child(4) {
  left: 38%;
  bottom: 27%;
  animation-delay: 2s;
}

.dust-particle:nth-child(5) {
  left: 50%;
  bottom: 18%;
  animation-delay: 2.7s;
}

.dust-particle:nth-child(6) {
  left: 60%;
  bottom: 32%;
  animation-delay: 3.1s;
}

@keyframes realisticDust {
  0% {
    opacity: 0;
    transform: translate3d(0, 15px, 0) scale(0.5);
  }

  20% {
    opacity: 0.8;
  }

  100% {
    opacity: 0;
    transform: translate3d(-80px, -70px, 0) scale(2.4);
  }
}

/* ============================================================
   FILM GRAIN
   ============================================================ */

.film-grain {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.055;

  background-image:
    radial-gradient(
      rgba(255, 255, 255, 0.9) 0.7px,
      transparent 0.7px
    );

  background-size: 5px 5px;
  animation: grainMove 0.25s steps(2) infinite;
}

@keyframes grainMove {
  0% {
    transform: translate(0, 0);
  }

  25% {
    transform: translate(-1%, 1%);
  }

  50% {
    transform: translate(1%, -1%);
  }

  75% {
    transform: translate(1%, 1%);
  }

  100% {
    transform: translate(-1%, -1%);
  }
}

/* ============================================================
   INTRO LOGO
   ============================================================ */

.intro-logo {
  position: absolute;
  z-index: 30;
  top: 24px;
  left: 28px;

  display: flex;
  align-items: center;
  gap: 12px;

  animation: logoAppear 0.8s ease forwards;
}

.intro-logo img {
  width: 86px;
  height: auto;
  object-fit: contain;

  border-radius: 12px;

  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.35));

  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(8px);
}

@keyframes logoAppear {
  from {
    opacity: 0;
    transform: translateY(-15px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ============================================================
   FARMING STATUS
   ============================================================ */

.farm-status {
  position: absolute;
  z-index: 20;

  left: 50%;
  top: 48%;

  transform: translate(-50%, -50%);

  text-align: center;
  color: white;

  text-shadow: 0 3px 20px rgba(0, 0, 0, 0.45);

  transition:
    opacity 0.8s ease,
    transform 0.8s ease;
}

.farm-status.hide {
  opacity: 0;
  transform: translate(-50%, -65%) scale(0.96);
  pointer-events: none;
}

.farm-status-icon {
  width: 62px;
  height: 62px;

  margin: 0 auto 15px;

  display: grid;
  place-items: center;

  border-radius: 20px;

  background: rgba(255, 255, 255, 0.13);

  border: 1px solid rgba(255, 255, 255, 0.24);

  backdrop-filter: blur(15px);

  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.18);

  animation: statusFloat 3s ease-in-out infinite;
}

@keyframes statusFloat {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-7px);
  }
}

.farm-status h2 {
  margin: 0;

  font-size: clamp(22px, 3vw, 34px);
  font-weight: 900;
  letter-spacing: -0.04em;
}

.farm-status p {
  margin: 9px 0 0;

  font-size: 12px;
  color: rgba(255, 255, 255, 0.78);
}

/* ============================================================
   FARM BADGES
   ============================================================ */

.farm-badges {
  position: absolute;
  z-index: 18;

  left: 30px;
  bottom: 28px;

  display: flex;
  gap: 9px;
  flex-wrap: wrap;

  transition:
    opacity 0.7s ease,
    transform 0.7s ease;
}

.farm-badges.hide {
  opacity: 0;
  transform: translateY(20px);
}

.farm-badge {
  display: flex;
  align-items: center;
  gap: 7px;

  padding: 9px 12px;

  border-radius: 999px;

  color: rgba(255, 255, 255, 0.92);

  background: rgba(9, 35, 22, 0.38);

  border: 1px solid rgba(255, 255, 255, 0.16);

  backdrop-filter: blur(12px);

  font-size: 10px;
  font-weight: 800;

  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.16);
}

.farm-badge svg {
  color: #b8e986;
}

/* ============================================================
   SKIP
   ============================================================ */

.skip-animation {
  position: absolute;

  z-index: 80;

  top: 24px;
  right: 24px;

  border: 1px solid rgba(255, 255, 255, 0.24);

  background: rgba(0, 0, 0, 0.24);

  color: white;

  backdrop-filter: blur(12px);

  border-radius: 999px;

  padding: 9px 14px;

  cursor: pointer;

  font-size: 10px;
  font-weight: 800;

  transition: 0.2s ease;
}

.skip-animation:hover {
  background: rgba(0, 0, 0, 0.42);
  transform: translateY(-1px);
}

/* ============================================================
   LOGIN OVERLAY
   ============================================================ */

.login-overlay {
  position: absolute;

  inset: 0;

  z-index: 60;

  display: flex;

  align-items: center;

  justify-content: center;

  padding: 24px;

  pointer-events: none;

  background: rgba(3, 15, 9, 0);

  transition: background 0.8s ease;
}

.login-overlay.visible {
  pointer-events: auto;

  background: rgba(3, 15, 9, 0.18);
}

/* ============================================================
   LOGIN CARD
   ============================================================ */

.login-card {
  width: min(1060px, 100%);

  min-height: 620px;

  display: grid;

  grid-template-columns: 1.02fr 0.98fr;

  overflow: hidden;

  border-radius: 30px;

  background: rgba(255, 255, 255, 0.96);

  border: 1px solid rgba(255, 255, 255, 0.75);

  box-shadow:
    0 40px 120px rgba(0, 0, 0, 0.35),
    0 10px 35px rgba(0, 0, 0, 0.16);

  opacity: 0;

  transform:
    translateX(-110vw)
    scale(0.94)
    rotate(-1deg);

  transition:
    opacity 0.7s ease,
    transform 1.1s cubic-bezier(0.16, 0.85, 0.22, 1);
}

.login-card.visible {
  opacity: 1;

  transform:
    translateX(0)
    scale(1)
    rotate(0);
}

/* ============================================================
   BRAND PANEL
   ============================================================ */

.login-brand {
  position: relative;

  overflow: hidden;

  padding: 48px;

  color: white;

  background:
    linear-gradient(
      145deg,
      rgba(4, 53, 31, 0.98),
      rgba(7, 103, 60, 0.96)
    );
}

.login-brand::before {
  content: "";

  position: absolute;

  width: 480px;
  height: 480px;

  right: -260px;
  bottom: -280px;

  border-radius: 50%;

  border: 90px solid rgba(190, 239, 128, 0.07);

  box-shadow:
    0 0 0 50px rgba(190, 239, 128, 0.025);
}

.login-brand::after {
  content: "";

  position: absolute;

  left: -100px;
  bottom: -120px;

  width: 330px;
  height: 330px;

  border-radius: 50%;

  background:
    radial-gradient(
      circle,
      rgba(182, 238, 119, 0.1),
      transparent 68%
    );
}

.brand-top {
  position: relative;

  display: flex;
  align-items: center;
  gap: 12px;

  z-index: 2;
}

.brand-logo {
  width: 60px;
  height: 60px;

  display: grid;
  place-items: center;

  border-radius: 17px;

  background: rgba(255, 255, 255, 0.12);

  border: 1px solid rgba(255, 255, 255, 0.18);

  backdrop-filter: blur(10px);

  overflow: hidden;
}

.brand-logo img {
  width: 100%;
  height: 100%;

  object-fit: contain;

  border-radius: 14px;
}

.brand-mini-title {
  font-size: 13px;
  font-weight: 900;
}

.brand-mini-subtitle {
  margin-top: 3px;

  font-size: 9px;

  color: rgba(255, 255, 255, 0.58);
}

.brand-content {
  position: relative;
  z-index: 2;

  margin-top: 72px;
}

.brand-title {
  margin: 0;

  font-size: clamp(35px, 4vw, 55px);

  line-height: 1.02;

  letter-spacing: -0.065em;

  font-weight: 950;
}

.brand-title span {
  color: #b9ef7d;
}

.brand-description {
  max-width: 440px;

  margin: 20px 0 0;

  color: rgba(255, 255, 255, 0.72);

  font-size: 13px;

  line-height: 1.75;
}

.brand-feature-grid {
  position: absolute;

  left: 48px;
  right: 48px;
  bottom: 38px;

  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 11px;

  z-index: 3;
}

.brand-feature {
  display: flex;

  align-items: center;

  gap: 8px;

  color: rgba(255, 255, 255, 0.84);

  font-size: 10px;

  font-weight: 750;
}

.brand-feature svg {
  color: #b9ef7d;
}

/* ============================================================
   FORM PANEL
   ============================================================ */

.login-form-panel {
  padding: 48px;

  display: flex;

  flex-direction: column;

  justify-content: center;

  background: rgba(255, 255, 255, 0.985);
}

.login-heading {
  margin-bottom: 25px;
}

.login-heading h1 {
  margin: 0;

  color: #13251a;

  font-size: 31px;

  font-weight: 950;

  letter-spacing: -0.05em;
}

.login-heading p {
  margin: 8px 0 0;

  color: #7b887f;

  font-size: 12px;

  line-height: 1.55;
}

/* ============================================================
   ROLE SWITCH
   ============================================================ */

.role-switch {
  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 6px;

  padding: 5px;

  margin-bottom: 20px;

  border-radius: 14px;

  background: #f0f5f1;
}

.role-button {
  min-height: 43px;

  border: 0;

  border-radius: 10px;

  background: transparent;

  color: #7c887f;

  cursor: pointer;

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 7px;

  font-size: 11px;

  font-weight: 850;

  transition: 0.2s ease;
}

.role-button:hover {
  color: #087a47;
}

.role-button.active {
  color: #087a47;

  background: white;

  box-shadow:
    0 5px 15px rgba(20, 55, 35, 0.08);
}

/* ============================================================
   FORM
   ============================================================ */

.form-field {
  margin-bottom: 15px;
}

.form-label {
  display: block;

  margin-bottom: 6px;

  color: #536057;

  font-size: 10px;

  font-weight: 850;
}

.input-wrap {
  position: relative;
}

.input-icon {
  position: absolute;

  left: 14px;
  top: 50%;

  transform: translateY(-50%);

  color: #95a198;

  pointer-events: none;
}

.form-input {
  width: 100%;

  min-height: 48px;

  border-radius: 12px;

  border: 1px solid #dce6df;

  outline: none;

  background: #fbfdfb;

  padding: 11px 43px;

  color: #1a2a20;

  font: inherit;

  font-size: 12px;

  transition: 0.2s ease;
}

.form-input:hover {
  border-color: #c5d6cb;
}

.form-input:focus {
  background: white;

  border-color: #20a96c;

  box-shadow:
    0 0 0 4px rgba(32, 169, 108, 0.09);
}

.password-toggle {
  position: absolute;

  right: 9px;
  top: 50%;

  transform: translateY(-50%);

  border: 0;

  background: transparent;

  color: #7e8c83;

  cursor: pointer;

  padding: 7px;
}

/* ============================================================
   OPTIONS
   ============================================================ */

.form-options {
  display: flex;

  align-items: center;

  justify-content: space-between;

  margin: 3px 0 20px;
}

.remember {
  display: flex;

  align-items: center;

  gap: 7px;

  color: #718078;

  font-size: 10px;
}

.remember input {
  accent-color: #087a47;
}

.forgot {
  border: 0;

  background: transparent;

  color: #087a47;

  cursor: pointer;

  font-size: 10px;

  font-weight: 800;
}

/* ============================================================
   MESSAGE
   ============================================================ */

.login-message {
  display: flex;

  align-items: flex-start;

  gap: 7px;

  margin-bottom: 14px;

  padding: 10px 12px;

  border-radius: 10px;

  background: #eef8f2;

  color: #087a47;

  font-size: 10px;

  line-height: 1.5;
}

.login-message svg {
  flex: 0 0 auto;
  margin-top: 1px;
}

/* ============================================================
   LOGIN BUTTON
   ============================================================ */

.login-button {
  width: 100%;

  min-height: 50px;

  border: 0;

  border-radius: 13px;

  cursor: pointer;

  color: white;

  background:
    linear-gradient(
      100deg,
      #087a47,
      #13aa68
    );

  box-shadow:
    0 12px 27px rgba(8, 122, 71, 0.22);

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 9px;

  font-size: 12px;

  font-weight: 900;

  transition: 0.22s ease;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);

  box-shadow:
    0 17px 33px rgba(8, 122, 71, 0.29);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.7;

  cursor: wait;
}

/* ============================================================
   SPINNER
   ============================================================ */

.spinner {
  width: 16px;
  height: 16px;

  border-radius: 50%;

  border:
    2px solid rgba(255, 255, 255, 0.35);

  border-top-color: white;

  animation:
    spinnerRotate 0.7s linear infinite;
}

@keyframes spinnerRotate {
  to {
    transform: rotate(360deg);
  }
}

/* ============================================================
   REGISTER
   ============================================================ */

.register-line {
  text-align: center;

  margin-top: 19px;

  color: #7c887f;

  font-size: 10px;
}

.register-button {
  border: 0;

  background: transparent;

  color: #087a47;

  cursor: pointer;

  font-weight: 900;

  padding: 0;
}

/* ============================================================
   SECURITY
   ============================================================ */

.security-note {
  display: flex;

  align-items: flex-start;

  gap: 8px;

  margin-top: 21px;

  padding: 11px;

  border-radius: 10px;

  background: #f2faf5;

  color: #637168;

  font-size: 9px;

  line-height: 1.55;
}

.security-note svg {
  flex: 0 0 auto;

  color: #087a47;
}

/* ============================================================
   RESPONSIVE
   ============================================================ */

@media (max-width: 900px) {
  .login-card {
    width: min(680px, 100%);

    grid-template-columns: 1fr;

    min-height: auto;

    max-height: calc(100vh - 30px);

    overflow-y: auto;
  }

  .login-brand {
    min-height: 330px;

    padding: 32px;
  }

  .brand-content {
    margin-top: 40px;
  }

  .brand-title {
    font-size: 38px;
  }

  .brand-feature-grid {
    position: relative;

    left: auto;
    right: auto;
    bottom: auto;

    margin-top: 30px;
  }

  .login-form-panel {
    padding: 32px;
  }
}

@media (max-width: 620px) {
  .intro-logo {
    left: 16px;
    top: 16px;
  }

  .intro-logo img {
    width: 70px;
  }

  .skip-animation {
    top: 16px;
    right: 16px;
  }

  .farm-status {
    width: 90%;
  }

  .farm-status h2 {
    font-size: 21px;
  }

  .farm-badges {
    left: 14px;
    right: 14px;
    bottom: 14px;
  }

  .login-overlay {
    padding: 12px;
    align-items: flex-start;
    overflow-y: auto;
  }

  .login-card {
    border-radius: 21px;
    margin: 20px 0;
  }

  .login-brand {
    min-height: 290px;

    padding: 25px;
  }

  .brand-title {
    font-size: 34px;
  }

  .brand-feature-grid {
    left: auto;
    right: auto;

    grid-template-columns: 1fr;

    margin-top: 22px;
  }

  .login-form-panel {
    padding: 26px 20px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .farm-photo,
  .sun-light,
  .film-grain,
  .dust-particle,
  .farm-status-icon {
    animation: none !important;
  }

  .login-card {
    transition: none;
  }
}
`;

/* ============================================================
   LOGIN PAGE
   ============================================================ */

export function LoginPage({
  onNavigateToRegister,
}: {
  onNavigateToRegister: () => void;
}) {
  const { login } = useAuth();

  const [farmingFinished, setFarmingFinished] =
    useState(false);

  const [role, setRole] =
    useState<UserRole>("farmer");

  const [showPassword, setShowPassword] =
    useState(false);

  const [identifier, setIdentifier] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [remember, setRemember] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  /* ==========================================================
     FARMING INTRO TIMER
     ========================================================== */

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFarmingFinished(true);
    }, 4800);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  /* ==========================================================
     SKIP INTRO
     ========================================================== */

  const skipAnimation = () => {
    setFarmingFinished(true);
  };

  /* ==========================================================
     LOGIN
     ========================================================== */

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setMessage("");

    const normalizedIdentifier =
      identifier.trim();

    if (!normalizedIdentifier) {
      setMessage(
        "Please enter your email or mobile number."
      );
      return;
    }

    const isEmail =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        normalizedIdentifier
      );

    const isMobile =
      /^[6-9]\d{9}$/.test(
        normalizedIdentifier
      );

    if (!isEmail && !isMobile) {
      setMessage(
        "Please enter a valid email address or 10-digit mobile number."
      );
      return;
    }

    if (!password.trim()) {
      setMessage(
        "Please enter your password."
      );
      return;
    }

    try {
      setLoading(true);

      /*
       * The existing AuthContext login API accepts:
       * login(identifier, password)
       *
       * Role selection is retained for the UI and
       * can be enforced inside AuthContext/backend.
       */

      const result = await login(
        normalizedIdentifier,
        password
      );

      if (!result.success) {
        setMessage(
          result.error ||
            "Unable to sign in. Please try again."
        );
        return;
      }

      /*
       * Successful authentication is handled by
       * the existing AuthContext/navigation flow.
       */
    } catch (error) {
      console.error(
        "AgriGo login error:",
        error
      );

      setMessage(
        "Something went wrong while signing in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     REGISTER
     ========================================================== */

  const handleRegister = () => {
    onNavigateToRegister();
  };

  /* ==========================================================
     FORGOT PASSWORD
     ========================================================== */

  const handleForgotPassword = () => {
    setMessage(
      "Password recovery can be connected to OTP or email verification."
    );
  };

  return (
    <>
      <style>{styles}</style>

      <main className="agrigo-login-page">

        {/* ==================================================
            FARM BACKGROUND
        ================================================== */}

        <section
          className="real-farm-scene"
          aria-hidden="true"
        >
          <img
            className="farm-photo"
            src="/assets/login-farm-tractor.jpg.jpg"
            alt="Tractor working on agricultural farmland"
          />

          <div className="farm-color-grade" />

          <div className="sun-light" />

          <div className="horizon-haze" />

          <div className="dust-layer">
            <span className="dust-particle" />
            <span className="dust-particle" />
            <span className="dust-particle" />
            <span className="dust-particle" />
            <span className="dust-particle" />
            <span className="dust-particle" />
          </div>

          <div className="film-grain" />
        </section>

        {/* ==================================================
            AGRIGO LOGO
        ================================================== */}

        <div className="intro-logo">
          <img
            src="/assets/AgriGo%20logo.png"
            alt="AgriGo"
          />
        </div>

        {/* ==================================================
            FARMING STATUS
        ================================================== */}

        <div
          className={`farm-status ${
            farmingFinished ? "hide" : ""
          }`}
          aria-live="polite"
        >
          <div className="farm-status-icon">
            <Tractor
              size={29}
              strokeWidth={1.8}
            />
          </div>

          <h2>
            Preparing your digital farm...
          </h2>

          <p>
            Connecting real-world farming with
            intelligent agriculture
          </p>
        </div>

        {/* ==================================================
            FARM INFORMATION
        ================================================== */}

        <div
          className={`farm-badges ${
            farmingFinished ? "hide" : ""
          }`}
          aria-hidden={farmingFinished}
        >
          <div className="farm-badge">
            <Sprout size={13} />
            <span>Smart Crops</span>
          </div>

          <div className="farm-badge">
            <Wheat size={13} />
            <span>Farm Intelligence</span>
          </div>

          <div className="farm-badge">
            <CloudSun size={13} />
            <span>Weather Ready</span>
          </div>

          <div className="farm-badge">
            <Satellite size={13} />
            <span>Digital Agriculture</span>
          </div>
        </div>

        {/* ==================================================
            SKIP INTRO
        ================================================== */}

        {!farmingFinished && (
          <button
            type="button"
            className="skip-animation"
            onClick={skipAnimation}
            aria-label="Skip farming introduction"
          >
            Skip farming intro
          </button>
        )}

        {/* ==================================================
            LOGIN OVERLAY
        ================================================== */}

        <div
          className={`login-overlay ${
            farmingFinished ? "visible" : ""
          }`}
        >
          <div
            className={`login-card ${
              farmingFinished ? "visible" : ""
            }`}
          >

            {/* ==================================================
                BRAND PANEL
            ================================================== */}

            <section className="login-brand">

              <div className="brand-top">
                <div className="brand-logo">
                  <img
                    src="/assets/AgriGo%20logo.png"
                    alt="AgriGo"
                  />
                </div>

                <div>
                  <div className="brand-mini-title">
                    AgriGo
                  </div>

                  <div className="brand-mini-subtitle">
                    Smart Digital Agriculture
                  </div>
                </div>
              </div>

              <div className="brand-content">
                <h2 className="brand-title">
                  Welcome back
                  <br />
                  to <span>AgriGo.</span>
                </h2>

                <p className="brand-description">
                  A connected digital agriculture
                  platform that brings farm
                  intelligence, crop planning,
                  weather, markets, finance,
                  government services and
                  AI-powered assistance together.
                </p>
              </div>

              <div className="brand-feature-grid">

                <div className="brand-feature">
                  <CheckCircle2 size={14} />
                  <span>
                    Smart farming assistance
                  </span>
                </div>

                <div className="brand-feature">
                  <Activity size={14} />
                  <span>
                    Real-time farm intelligence
                  </span>
                </div>

                <div className="brand-feature">
                  <Wheat size={14} />
                  <span>
                    Crop & market intelligence
                  </span>
                </div>

                <div className="brand-feature">
                  <Shield size={14} />
                  <span>
                    Secure farmer services
                  </span>
                </div>

              </div>
            </section>

            {/* ==================================================
                LOGIN FORM
            ================================================== */}

            <section className="login-form-panel">

              <div className="login-heading">
                <h1>Sign in</h1>

                <p>
                  Access your AgriGo agriculture
                  dashboard and farm services.
                </p>
              </div>

              {/* ==================================================
                  ROLE
              ================================================== */}

              <div
                className="role-switch"
                role="tablist"
                aria-label="Account type"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={role === "farmer"}
                  className={`role-button ${
                    role === "farmer"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setRole("farmer")
                  }
                >
                  <UserRound size={15} />
                  Farmer
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={role === "admin"}
                  className={`role-button ${
                    role === "admin"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setRole("admin")
                  }
                >
                  <ShieldCheck size={15} />
                  Admin / Officer
                </button>
              </div>

              {/* ==================================================
                  LOGIN FORM
              ================================================== */}

              <form onSubmit={handleLogin}>

                {/* IDENTIFIER */}

                <div className="form-field">
                  <label
                    className="form-label"
                    htmlFor="agrigo-login-identifier"
                  >
                    Email address or mobile number
                  </label>

                  <div className="input-wrap">
                    <Smartphone
                      className="input-icon"
                      size={17}
                      aria-hidden="true"
                    />

                    <input
                      id="agrigo-login-identifier"
                      className="form-input"
                      type="text"
                      inputMode="email"
                      autoComplete="username"
                      value={identifier}
                      onChange={(event) =>
                        setIdentifier(
                          event.target.value
                        )
                      }
                      placeholder="Email or 10-digit mobile"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                {/* PASSWORD */}

                <div className="form-field">
                  <label
                    className="form-label"
                    htmlFor="agrigo-login-password"
                  >
                    Password
                  </label>

                  <div className="input-wrap">
                    <LockKeyhole
                      className="input-icon"
                      size={17}
                      aria-hidden="true"
                    />

                    <input
                      id="agrigo-login-password"
                      className="form-input"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      placeholder="Enter your password"
                      disabled={loading}
                      required
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowPassword(
                          (previous) =>
                            !previous
                        )
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      aria-pressed={showPassword}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>
                </div>

                {/* OPTIONS */}

                <div className="form-options">
                  <label className="remember">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(event) =>
                        setRemember(
                          event.target.checked
                        )
                      }
                      disabled={loading}
                    />

                    <span>Remember me</span>
                  </label>

                  <button
                    type="button"
                    className="forgot"
                    onClick={handleForgotPassword}
                    disabled={loading}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* MESSAGE */}

                {message && (
                  <div
                    className="login-message"
                    role="alert"
                  >
                    <CheckCircle2
                      size={14}
                      aria-hidden="true"
                    />

                    <span>{message}</span>
                  </div>
                )}

                {/* LOGIN BUTTON */}

                <button
                  type="submit"
                  className="login-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner"
                        aria-hidden="true"
                      />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Continue Farming
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>

              </form>

              {/* ==================================================
                  REGISTER
              ================================================== */}

              <div className="register-line">
                <span>New to AgriGo? </span>

                <button
                  type="button"
                  className="register-button"
                  onClick={handleRegister}
                  disabled={loading}
                >
                  Create Farmer Account
                  <ChevronRight
                    size={12}
                    style={{
                      verticalAlign: "middle",
                    }}
                  />
                </button>
              </div>

              {/* ==================================================
                  SECURITY
              ================================================== */}

              <div className="security-note">
                <LockKeyhole
                  size={15}
                  aria-hidden="true"
                />

                <div>
                  Your account information should
                  be protected using secure
                  authentication. Never share your
                  password, OTP or sensitive
                  financial information.
                </div>
              </div>

            </section>
          </div>
        </div>

      </main>
    </>
  );
}

export default LoginPage;
