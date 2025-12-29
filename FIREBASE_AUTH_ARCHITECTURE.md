# Firebase Auth Wiring - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    React Application                             │
│                 (src/pages/public/*.tsx)                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Firebase Auth Helper Library                        │
│              (src/lib/firebaseAuth.ts)                          │
│                                                                 │
│  Exports:                                                       │
│  • signUp(email, password)                                      │
│  • signIn(email, password)                                      │
│  • resetPassword(email)                                         │
│  • signOut()                                                    │
│  • getCurrentUser()                                             │
│  • onAuthChange(callback)                                       │
│  • getErrorMessage(code)                                        │
│                                                                 │
│  Features:                                                      │
│  • Error handling with user-friendly messages                   │
│  • Automatic email verification on signup                       │
│  • Firebase configuration included                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Firebase SDKs                                  │
│        (firebase/app, firebase/auth)                            │
│                                                                 │
│  • initializeApp()                                              │
│  • getAuth()                                                    │
│  • createUserWithEmailAndPassword()                             │
│  • signInWithEmailAndPassword()                                 │
│  • sendPasswordResetEmail()                                     │
│  • sendEmailVerification()                                      │
│  • signOut()                                                    │
│  • onAuthStateChanged()                                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Firebase Authentication Service                    │
│          (storyverse-830fc.firebaseapp.com)                    │
│                                                                 │
│  • User account creation & management                           │
│  • Email verification                                           │
│  • Password reset                                               │
│  • Session management                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Page Component Flow

```
┌─────────────────┐
│  SignupPage     │
│  ═════════════  │
│  • Email input  │
│  • Password (2) │
│  • Validation   │
│  • Sign up btn  │
└────────┬────────┘
         │ handleSignup()
         │ calls: signUp(email, password)
         ▼
    Firebase.auth
    .createUserWithEmailAndPassword()
         │
         ├─ Sends verification email
         │
         ├─ Success
         │  └─ navigate('/verify-otp') ✅
         │
         └─ Error
            └─ Show error message


┌─────────────────┐
│  SigninPage     │
│  ═════════════  │
│  • Email input  │
│  • Password in  │
│  • Validation   │
│  • Sign in btn  │
└────────┬────────┘
         │ handleSignin()
         │ calls: signIn(email, password)
         ▼
    Firebase.auth
    .signInWithEmailAndPassword()
         │
         ├─ Success
         │  └─ navigate('/app/dashboard') ✅
         │
         └─ Error
            └─ Show error message


┌──────────────────────────────┐
│  ForgotPasswordPage          │
│  ═════════════════════════   │
│  • Email input               │
│  • Send verification link btn│
└────────┬─────────────────────┘
         │ handleSendVerification()
         │ calls: resetPassword(email)
         ▼
    Firebase.auth
    .sendPasswordResetEmail()
         │
         ├─ Sends reset email
         │
         ├─ Success
         │  └─ navigate('/signin') ✅
         │
         └─ Error
            └─ Show error message


┌──────────────────────────────┐
│  OTPVerificationPage         │
│  ═════════════════════════   │
│  • OTP display input         │
│  • Continue button           │
│  • Resend OTP button         │
│  • Back to Signup button     │
└────────┬─────────────────────┘
         │ handleContinue()
         │ calls: getCurrentUser()
         │        + user.reload()
         ▼
    Firebase.auth.currentUser
         │
         ├─ Check: emailVerified?
         │
         ├─ Yes
         │  └─ navigate('/app/dashboard') ✅
         │
         └─ No
            └─ Show error message
               "Check your inbox for verification link"
               
         │ handleResendOtp()
         │ calls: sendEmailVerification(user)
         ▼
    Firebase sends verification email again ✅
```

---

## Data Flow - Complete Signup Journey

```
User Input
    │
    ▼
┌─────────────────────────┐
│ SignupPage Input        │
│ Email: user@test.com    │
│ Password: ••••••        │
│ Confirm:  ••••••        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Validation in Page      │
│ ✓ Email not empty       │
│ ✓ Passwords match       │
│ ✓ Password length ≥ 6   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Call signUp()           │
│ from firebaseAuth.ts    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Firebase API Call       │
│ .createUserWithEmail... │
│ .sendEmailVerification()│
└────────┬────────────────┘
         │
         ├─ Success
         │  └─────────────────────┐
         │                        │
         │  Response:             │
         │  User object created   │
         │  Email sent            │
         │                        │
         │                        ▼
         │              ┌──────────────────┐
         │              │ Navigate to      │
         │              │ /verify-otp      │
         │              └──────────────────┘
         │                        │
         │                        ▼
         │              ┌──────────────────┐
         │              │ OTPPage shows:   │
         │              │ "Check email"    │
         │              │ Continue button  │
         │              └──────────────────┘
         │                        │
         │                        ▼
         │              ┌──────────────────┐
         │              │ User clicks      │
         │              │ email link       │
         │              │ (outside app)    │
         │              └──────────────────┘
         │                        │
         │                        ▼
         │              ┌──────────────────┐
         │              │ Firebase sets:   │
         │              │ emailVerified    │
         │              │ = true           │
         │              └──────────────────┘
         │                        │
         │                        ▼
         │              ┌──────────────────┐
         │              │ Return to app    │
         │              │ Click Continue   │
         │              └──────────────────┘
         │                        │
         │                        ▼
         │              ┌──────────────────┐
         │              │ Check email      │
         │              │ Verified = true  │
         │              │ Navigate to dash │
         │              └──────────────────┘
         │
         └─ Error
            └─────────────────────┐
                                  │
                  Error Response:  │
                  • Email in use   │
                  • Weak password  │
                  • Invalid format │
                                  │
                                  ▼
                        ┌──────────────────┐
                        │ Show Error Msg   │
                        │ Stay on page     │
                        └──────────────────┘
```

---

## Firebase Config Integration

```
┌─────────────────────────────────────────────────┐
│         Firebase Configuration                   │
│     (in src/lib/firebaseAuth.ts)                │
│                                                 │
│  const firebaseConfig = {                       │
│    apiKey: "AIzaSyBhVllTe...",                  │
│    authDomain: "storyverse-830fc...",          │
│    projectId: "storyverse-830fc",              │
│    storageBucket: "storyverse-830fc...",       │
│    messagingSenderId: "55968683388",           │
│    appId: "1:55968683388:web:...",             │
│    measurementId: "G-3JBD3EYPG1"               │
│  }                                              │
│                                                 │
│  const app = initializeApp(firebaseConfig)     │
│  export const auth = getAuth(app)              │
└─────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│    All Auth Functions Use This Instance         │
│                                                 │
│  createUserWithEmailAndPassword(auth, ...)      │
│  signInWithEmailAndPassword(auth, ...)          │
│  sendPasswordResetEmail(auth, ...)              │
│  signOut(auth)                                  │
│  getAuth(app) → Single auth instance            │
└─────────────────────────────────────────────────┘
```

---

## Error Handling Flow

```
Firebase Error Code
        │
        ▼
┌─────────────────────────────────┐
│ getErrorMessage(code)           │
│ (in firebaseAuth.ts)            │
└────────┬────────────────────────┘
         │
         ├─ "auth/email-already-in-use"
         │  └─ Return: "Email already registered"
         │
         ├─ "auth/weak-password"
         │  └─ Return: "Password too weak"
         │
         ├─ "auth/user-not-found"
         │  └─ Return: "User not found"
         │
         ├─ "auth/wrong-password"
         │  └─ Return: "Wrong password"
         │
         └─ [default]
            └─ Return: "An error occurred..."
                       │
                       ▼
              ┌──────────────────────┐
              │ Throw new Error()    │
              │ with message         │
              └──────────────────────┘
                       │
                       ▼
              ┌──────────────────────┐
              │ Catch in Component   │
              │ .catch((error) => {  │
              │   setErrorMessage()  │
              │ })                   │
              └──────────────────────┘
                       │
                       ▼
              ┌──────────────────────┐
              │ Display Error to     │
              │ User in UI           │
              │ (inline text)        │
              └──────────────────────┘
```

---

## Router Integration

```
┌──────────────────────────────────────────┐
│         App.tsx (Router Setup)           │
│                                          │
│  <BrowserRouter>                         │
│    <Routes>                              │
│      <Route path="/" ... />              │
│      <Route path="/signup" ... />        │
│      <Route path="/signin" ... />        │
│      <Route path="/forgot-password" .../>│
│      <Route path="/verify-otp" ... />    │
│      <Route path="/app/dashboard" ... /> │
│    </Routes>                             │
│  </BrowserRouter>                        │
└──────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  Components Use useNavigate()             │
│                                          │
│  const navigate = useNavigate()          │
│                                          │
│  navigate('/verify-otp')  ← SignupPage   │
│  navigate('/app/dashboard')← SigninPage  │
│  navigate('/signin')      ← ResetPage    │
│  navigate('/signup')      ← OTPPage      │
└──────────────────────────────────────────┘
```

---

## Summary

**Three Layers:**

1. **UI Layer** (React Components)
   - SignupPage, SigninPage, ForgotPasswordPage, OTPVerificationPage
   - Handle user input, display errors, manage loading

2. **Logic Layer** (src/lib/firebaseAuth.ts)
   - Wrapper functions around Firebase SDK
   - Error handling & user-friendly messages
   - Centralized configuration

3. **Backend Layer** (Firebase Authentication)
   - User account management
   - Email verification
   - Password reset
   - Session management

**Flow: UI → Logic → Firebase → Backend → Firebase → Logic → UI**

---

*Architecture Overview - Firebase Auth Wiring*  
*Implementation Date: December 27, 2025*
