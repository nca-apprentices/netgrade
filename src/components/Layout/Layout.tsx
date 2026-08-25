import React, { useEffect, useRef } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useIonRouter } from '@ionic/react';
import { createGesture } from '@ionic/core';

// comment to test verification for github //

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useIonRouter();
  const contentRef = useRef<HTMLIonContentElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    const gesture = createGesture({
      el: contentRef.current,
      threshold: 10,
      gestureName: 'swipe',
      onStart: () => {
        contentRef.current?.style.setProperty(
          '--background',
          'var(--ion-color-light-shade)',
        );
      },
      onMove: (ev) => {
        if (ev.deltaX > 0) {
          contentRef.current?.style.setProperty(
            '--background',
            'var(--ion-color-light-shade)',
          );
        }
      },
      onEnd: (ev) => {
        contentRef.current?.style.setProperty(
          '--background',
          'var(--ion-color-light)',
        );
        if (ev.deltaX > 100) {
          router.back();
        }
      },
    });

    gesture.enable();

    return () => {
      gesture.destroy();
    };
  }, [router]);

  return (
    <IonPage>
      <IonContent
        ref={contentRef}
        className="ion-padding"
        scrollY={false}
        style={{
          '--padding-top': '0',
          '--padding-bottom': '16px',
          '--padding-start': '16px',
          '--padding-end': '16px',
          '--background': 'var(--ion-color-light)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          {children}
        </div>
      </IonContent>
    </IonPage>
  );
};
