# Signal iOS + React Native

This is an experimental fork of the official [Signal iOS](https://github.com/signalapp/Signal-iOS) with the sole purpose of testing brownfield support for Expo and React Native in large native-first codebases. Its commits serve as a reference for anyone interested in integrating React Native into an existing iOS app, especially those that don't want to refactor the whole project structure to accommodate React Native.

This project uses Expo's brownfield isolated approach, plus the [expo-brownfield Navigation API](https://docs.expo.dev/brownfield/overview/) — the RN screen dismisses itself by calling `popToNative()` from JavaScript instead of relying on a native Done button.

## Integration steps

Check commits for detailed steps, full instructions can be found in the [expo-brownfield documentation](https://docs.expo.dev/brownfield/overview/).

1. **Create the Expo app**: Run `npx create-expo-app expo-app --template default@canary-sdk-56` to set up a new Expo app.
2. **Install expo-brownfield**: Add expo-brownfield to your project `npx expo install expo-brownfield` and generate a Swift Package.
3. **Add React Native view**: Integrate the Expo app Swift Package into the existing iOS app.

<details>
<summary>Signal iOS</summary>

# Signal iOS

Signal is a free and open source messaging app for simple private communication with friends.

[![Available on the App Store](https://signal.org/external/images/app-store-download-badge.svg)](https://apps.apple.com/app/id874139669)

Also available on [Android](https://github.com/signalapp/signal-android) and [Desktop](https://github.com/signalapp/signal-desktop).

## Questions?

For troubleshooting and questions, please visit our [support center](https://support.signal.org/) or [unofficial community forum](https://community.signalusers.org/).

## Contributing Bug Reports

The best way to submit a bug report or support request is [via the Support Center](https://support.signal.org/hc/requests/new). Signal iOS doesn't collect any analytics or telemetry, and we rely on your feedback to help us troubleshoot and fix problems when something isn't working correctly.

## Contributing Code

Instructions for how to configure your development environment and build Signal iOS can be found in [BUILDING.md](https://github.com/signalapp/Signal-iOS/blob/main/BUILDING.md). We also recommend reading the [contribution guidelines](https://github.com/signalapp/Signal-iOS/blob/main/CONTRIBUTING.md).

## Contributing Ideas

Have something you want to say about Signal Foundation projects or want to be part of the conversation? Get involved in the [community forum](https://community.signalusers.org).

## Cryptography Notice

This distribution includes cryptographic software. The country in which you currently reside may have restrictions on the import, possession, use, and/or re-export to another country, of encryption software.
BEFORE using any encryption software, please check your country's laws, regulations and policies concerning the import, possession, or use, and re-export of encryption software, to see if this is permitted.
See <http://www.wassenaar.org/> for more information.

The U.S. Government Department of Commerce, Bureau of Industry and Security (BIS), has classified this software as Export Commodity Control Number (ECCN) 5D002.C.1, which includes information security software using or performing cryptographic functions with asymmetric algorithms.
The form and manner of this distribution makes it eligible for export under the License Exception ENC Technology Software Unrestricted (TSU) exception (see the BIS Export Administration Regulations, Section 740.13) for both object code and source code.

## License

Copyright 2013-2025 Signal Messenger, LLC

Licensed under the GNU AGPLv3: https://www.gnu.org/licenses/agpl-3.0.html

_Apple and the Apple logo are trademarks of Apple Inc., registered in the U.S. and other countries. App Store is a service mark of Apple Inc., registered in the U.S. and other countries._

</details>
