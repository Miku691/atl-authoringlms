# Google Stitch Prompt: Student Authentication Module Redesign

## Goal
Redesign the core authentication flow for the "EduFlow" Institute Management System (IMS). The goal is to transform the existing functional screens into a premium, professional, and airy SaaS experience that matches our landing page's "Proportional Elegance" aesthetic.

## Visual Identity (Source: Landing Page)
- **Palette**: 
  - Primary: `#2A6DF4` (Bright Blue)
  - Secondary/Deep: `#1A3D8A` (Deep Blue)
  - Text/Dark: `#0F1D3A` (Ebony)
  - UI Accents: `#F7F9FF` (Light Gray-Blue), `#E2E8F8` (Soft Border)
- **Typography**: Modern Sans (Inter/Roboto), font-weight: 800 for headings, tight tracking (-0.02em).
- **Shapes**: Rounded corners (20px to 24px), full-rounded buttons (pill), layered floating cards with soft shadows.
- **Atmosphere**: High whitespace, minimalist, micro-animations (Framer Motion style), high contrast.

## Screens to Redesign

### 1. Login Screen
- **Components**:
  - Centralized floating Card with a soft glassmorphism effect.
  - Branding: Small EduFlow logo at the top.
  - Header: Large title "Welcome Back" and subtle subtitle.
  - Inputs: Floating Label Inputs with left-aligned icons (User for username, Lock for password).
  - Password Link: Small "Forgot password?" link positioned above the password field.
  - CTA: Full-width Gradient Button ("Sign in") with an ArrowRight icon.
  - Divider: Elegant line with text "New here?".
  - Secondary Action: Ghost button with border for "Register Institute".

### 2. OTP Verification Screen
- **Components**:
  - Success Indicator: A subtle green alert box or icon showing "OTP Sent".
  - Code Input: A prominent, centered 6-digit numeric input with large font size and generous tracking.
  - Help Text: "Didn't receive the code?" with a bold blue "Resend" button.
  - CTA: High-contrast button "Verify & Access".

### 3. Forgot Password (Multi-step)
- **Layout**: Use a progress indicator (steps) if possible, or transition effects between steps.
- **Step 1 (Recovery)**: Minimalist email input field.
- **Step 2 (Verify)**: KeyRound icon and masked code input.
- **Step 3 (Reset)**: Dual password fields with "Eye" toggles for visibility. Strong feedback on password matching.

### 4. Force Password Reset
- **Context**: Security enforcement for temporary passwords.
- **Components**:
  - Security Alert: Amber-tinted callout box explaining why the reset is required.
  - Inputs: New Password and Confirm Password.
  - CTA: "Update & Login" with a CheckCircle icon.

## Design Instructions for Stitch
- Use **SVG illustrations** or high-quality abstract educational photography on one side if using a split-screen layout.
- Ensure all states (Loading, Error, Active) are visually distinct using the EduFlow color tokens.
- Maintain a "Bento-grid" or "Clean Paper" feel for the cards.
- **Focus on Mobility**: Ensure the design looks premium on both Desktop and Mobile.
