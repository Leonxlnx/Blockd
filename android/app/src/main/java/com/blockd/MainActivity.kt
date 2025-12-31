package com.blockd

import android.content.Intent
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "Blockd"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  /**
   * CRITICAL: Handle new intents when app is already running
   * Without this, the old intent is read instead of the new block command
   */
  override fun onNewIntent(intent: Intent) {
      super.onNewIntent(intent)
      // WICHTIG: Überschreibe den alten Intent mit dem neuen!
      // Ohne das liest BlockingModule immer nur den uralten Start-Intent.
      setIntent(intent) 
  }
}
