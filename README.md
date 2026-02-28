# Uzzap Buddy Chat 📱💬

A modern mobile chat application inspired by classic social platforms, built with **Expo**, **React Native**, and the **Blink SDK**. Connect with buddies, join region-based chatrooms, and enjoy real-time messaging in a beautiful, dark-themed UI.

## 🌟 Features

- **Real-time Chatrooms**: Join various rooms filtered by regions (Metro Manila, Luzon, Visayas, Mindanao, etc.).
- **Buddy System**: Find and add buddies, see their status, and build your social network.
- **Dynamic User Profiles**: Customize your display name, status message, and see your joined date.
- **Beautiful UI/UX**: Dark-themed, high-contrast interface with smooth animations and intuitive navigation.
- **Secure Authentication**: Built-in sign-up and login powered by Blink Auth.
- **Real-time Updates**: Instant messaging and presence updates via Blink Realtime.

## 🛠️ Tech Stack

- **Frontend**: React Native, Expo (SDK 54)
- **Styling**: Tailwind CSS (NativeWind), StyleSheet
- **State Management**: TanStack Query (React Query), Zustand
- **Database & Auth**: Blink SDK
- **Animations**: React Native Reanimated
- **Icons**: Expo Vector Icons (Ionicons)

## 🚀 Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/cyanideph/uzzap-buddy-chat.git
    ```
2.  **Install dependencies**:
    ```bash
    bun install
    ```
3.  **Start the development server**:
    ```bash
    bun dev
    ```
4.  **Open in Browser or Expo Go**: Navigate to the provided local URL.

## 📁 Project Structure

- `app/`: Expo Router file-based navigation.
  - `(auth)/`: Authentication screens (Login, Register).
  - `(tabs)/`: Main application tabs (Chatrooms, Buddies, Profile).
  - `chatroom/`: Dynamic routes for individual chatrooms.
  - `profile/`: Dynamic routes for user profiles.
- `components/ui/`: Reusable UI component library (Button, Input, Card, etc.).
- `constants/`: Design system tokens, platform helpers, and animation configs.
- `context/`: React Context providers (Auth, etc.).
- `lib/`: SDK initialization and library configurations.

## 📜 License

MIT License. Created with ❤️ by cyanideph.
