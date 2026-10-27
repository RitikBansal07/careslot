import { Platform } from 'react-native';

export interface PreCallDiagnostics {
  cameraSupported: boolean;
  microphoneSupported: boolean;
  cameraGranted: boolean;
  microphoneGranted: boolean;
  errorMessage?: string;
}

class TelehealthService {
  private localStream: MediaStream | null = null;
  private isAudioMuted: boolean = false;
  private isVideoMuted: boolean = false;

  /**
   * Diagnostic check for camera and mic access
   */
  async runPreCallDiagnostics(): Promise<PreCallDiagnostics> {
    if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !navigator.mediaDevices) {
      return {
        cameraSupported: true,
        microphoneSupported: true,
        cameraGranted: true,
        microphoneGranted: true,
      };
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // Stop tracks immediately after testing permissions
      stream.getTracks().forEach((track) => track.stop());

      return {
        cameraSupported: true,
        microphoneSupported: true,
        cameraGranted: true,
        microphoneGranted: true,
      };
    } catch (err: any) {
      return {
        cameraSupported: true,
        microphoneSupported: true,
        cameraGranted: false,
        microphoneGranted: false,
        errorMessage: err?.message || 'Camera or microphone access denied.',
      };
    }
  }

  /**
   * Starts local camera preview stream
   */
  async startLocalPreview(videoElement?: HTMLVideoElement | null): Promise<MediaStream | null> {
    if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !navigator.mediaDevices) {
      return null;
    }

    try {
      if (this.localStream) {
        this.stopLocalPreview();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true,
      });

      this.localStream = stream;

      if (videoElement) {
        videoElement.srcObject = stream;
        videoElement.muted = true; // prevent feedback loop for local preview
        await videoElement.play().catch(() => {});
      }

      return stream;
    } catch (err) {
      console.warn('Unable to acquire camera feed:', err);
      return null;
    }
  }

  /**
   * Stops local stream tracks
   */
  stopLocalPreview(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
  }

  /**
   * Toggles microphone audio track
   */
  toggleMicrophone(muted: boolean): boolean {
    this.isAudioMuted = muted;
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }
    return this.isAudioMuted;
  }

  /**
   * Toggles camera video track
   */
  toggleCamera(disabled: boolean): boolean {
    this.isVideoMuted = disabled;
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = !disabled;
      });
    }
    return this.isVideoMuted;
  }

  isMicMuted(): boolean {
    return this.isAudioMuted;
  }

  isCamDisabled(): boolean {
    return this.isVideoMuted;
  }
}

export const telehealthService = new TelehealthService();

