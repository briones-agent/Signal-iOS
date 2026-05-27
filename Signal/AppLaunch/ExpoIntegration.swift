//
// Copyright 2026 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only
//

//
//  Signal iOS + Expo Brownfield demo
//
//  Bootstraps the embedded React Native runtime, seeds shared state with
//  a mock chat list, and listens for messages from the Safety Center RN
//  screen. The RN screen dismisses itself by calling `popToNative()` from
//  JavaScript — no UIKit Done button hooked from the host side.
//

#if os(iOS)
    public import Foundation
    public import UIKit
    internal import SignalExpo

    @objc public final class ExpoIntegration: NSObject {
        /// Call from AppDelegate.didFinishLaunchingWithOptions. Initializes
        /// the React Native host, seeds shared state, subscribes to
        /// messages from RN, and wires the brownfield `popToNative`
        /// notification so the RN screen can dismiss the host modal from
        /// JavaScript.
        @objc public static func bootstrap() {
            ReactNativeHostManager.shared.initialize()
            seedSharedState()
            registerMessageHandlers()
            observePopToNative()
        }

        /// The brownfield `popToNative()` JS call posts a notification.
        /// The shipped `ReactNativeViewController` listens for it and pops
        /// from its navigation stack — but the RN screen is presented as a
        /// modal here, so we listen ourselves and dismiss the topmost
        /// presentation. Keeps the JS dismiss API working regardless of
        /// whether the host pushes or presents.
        private static func observePopToNative() {
            NotificationCenter.default.addObserver(
                forName: Notification.Name("popToNative"),
                object: nil,
                queue: .main
            ) { note in
                let animated = (note.userInfo?["animated"] as? Bool) ?? false
                dismissPresentation(animated: animated)
            }
        }

        private static func dismissPresentation(animated: Bool) {
            guard let scene = UIApplication.shared.connectedScenes
                    .compactMap({ $0 as? UIWindowScene }).first,
                  let window = scene.windows.first(where: { $0.isKeyWindow }) ?? scene.windows.first,
                  let root = window.rootViewController
            else { return }
            var presenter = root
            while let next = presenter.presentedViewController { presenter = next }
            presenter.dismiss(animated: animated)
        }

        /// Returns a view controller hosting the Safety Center RN screen.
        /// The RN side owns its own "Done" affordance via `popToNative()`
        /// from the brownfield Navigation API.
        @objc public static func makeSafetyCenterViewController() -> UIViewController {
            let rn = ReactNativeViewController(moduleName: "main")
            rn.modalPresentationStyle = .fullScreen
            return rn
        }

        /// Demo helper: when launched with `-SignalExpoAutoPresent YES`,
        /// present the Safety Center as a full-screen modal. With
        /// `-SignalExpoAutoDemo YES`, fire a self-driving sequence so the
        /// recording demonstrates the Navigation API (popToNative) without
        /// requiring external UI automation.
        @objc public static func scheduleAutoPresentIfRequested() {
            guard UserDefaults.standard.bool(forKey: "SignalExpoAutoPresent") else { return }
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                presentOnKeyWindow()
                if UserDefaults.standard.bool(forKey: "SignalExpoAutoDemo") {
                    scheduleDemoActions()
                }
            }
        }

        private static func scheduleDemoActions() {
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) {
                BrownfieldMessaging.sendMessage([
                    "type": "CHAT_OPENED",
                    "name": "(demo) Reading shared state…",
                ])
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 5.0) { markAllRead() }
            // Self-dismiss via the Navigation API at the end of the loop so
            // the recording shows the round-trip back to Signal's native UI.
            // Same notification the JS `popToNative()` call posts.
            DispatchQueue.main.asyncAfter(deadline: .now() + 9.0) {
                NotificationCenter.default.post(
                    name: Notification.Name("popToNative"),
                    object: nil,
                    userInfo: ["animated": true]
                )
            }
        }

        private static func presentOnKeyWindow() {
            guard let scene = UIApplication.shared.connectedScenes
                    .compactMap({ $0 as? UIWindowScene }).first,
                  let window = scene.windows.first(where: { $0.isKeyWindow }) ?? scene.windows.first,
                  let root = window.rootViewController
            else { return }
            var presenter = root
            while let next = presenter.presentedViewController { presenter = next }
            if presenter !== root {
                presenter.dismiss(animated: false) {
                    root.present(makeSafetyCenterViewController(), animated: true)
                }
            } else {
                root.present(makeSafetyCenterViewController(), animated: true)
            }
        }

        private static func seedSharedState() {
            BrownfieldState.set("unreadTotal", 23)
            BrownfieldState.set("storiesCount", 4)
            BrownfieldState.set("linkedDevices", 2)
            BrownfieldState.set("chats", sampleChats())
        }

        private static func sampleChats() -> [[String: Any]] {
            [
                [
                    "id": 1,
                    "name": "Note to Self",
                    "preview": "ringrtc-ios-build-v2.69.1 cached",
                    "initials": "NS",
                    "color": "#3A76F0",
                    "unread": 0,
                    "pinned": true,
                ],
                [
                    "id": 2,
                    "name": "Family",
                    "preview": "Mom: Are we still on for Sunday?",
                    "initials": "FA",
                    "color": "#F2994A",
                    "unread": 6,
                    "pinned": true,
                ],
                [
                    "id": 3,
                    "name": "Signal Team",
                    "preview": "Engineering: v7.45.1 cut",
                    "initials": "ST",
                    "color": "#9B51E0",
                    "unread": 12,
                    "pinned": false,
                ],
                [
                    "id": 4,
                    "name": "Brownfield WG",
                    "preview": "Gabriel: Navigation API works",
                    "initials": "BW",
                    "color": "#27AE60",
                    "unread": 5,
                    "pinned": false,
                ],
                [
                    "id": 5,
                    "name": "Coffee club ☕",
                    "preview": "Sara: New beans at Saint Frank",
                    "initials": "CC",
                    "color": "#EB5757",
                    "unread": 0,
                    "pinned": false,
                ],
            ]
        }

        private static func registerMessageHandlers() {
            _ = BrownfieldMessaging.addListener { message in
                guard let type = message["type"] as? String else { return }
                switch type {
                case "OPEN_CHAT":
                    openChat(message)
                case "MARK_ALL_READ":
                    markAllRead()
                default:
                    break
                }
            }
        }

        private static func openChat(_ message: [String: Any?]) {
            BrownfieldMessaging.sendMessage([
                "type": "CHAT_OPENED",
                "id": (message["id"] ?? 0) as Any,
                "name": (message["name"] ?? "") as Any,
            ])
        }

        private static func markAllRead() {
            guard var chats = BrownfieldState.get("chats") as? [[String: Any]] else { return }
            for i in chats.indices { chats[i]["unread"] = 0 }
            BrownfieldState.set("chats", chats)
            BrownfieldState.set("unreadTotal", 0)
            BrownfieldMessaging.sendMessage(["type": "CHATS_MARKED_READ"])
        }
    }
#endif
