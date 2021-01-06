package com.weilican.emojiscratch;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.Dialog;
import android.os.Build;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebView;
import android.widget.Button;
import java.util.Locale;
import androidx.annotation.RequiresApi;

public class MainActivity extends Activity {

    TextToSpeech tts;

    public class WebAppInterface {
        @JavascriptInterface
        public void trySpeak(String s) {
            if (null != tts) {
                tts.speak(s, TextToSpeech.QUEUE_FLUSH, null);
            }
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.KITKAT)
    @Override
    public void onBackPressed() {
        WebView wv = findViewById(R.id.webView);
        wv.evaluateJavascript("javascript:isTitle()", new ValueCallback<String>() {
            @Override
            public void onReceiveValue(String s) {
                if ("true".equals(s)) {
                    finish();
                }
                Dialog dlg = new Dialog(MainActivity.this);
                dlg.setContentView(R.layout.layout_menu);

                Button btnResume = dlg.findViewById(R.id.btnResume);
                btnResume.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        dlg.dismiss();
                    }
                });

                Button btnTitle = dlg.findViewById(R.id.btnTitle);
                btnTitle.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        WebView wv = findViewById(R.id.webView);
                        wv.loadUrl("javascript:returnTitle()");
                        dlg.dismiss();
                    }
                });

                Button btnExit = dlg.findViewById(R.id.btnExit);
                btnExit.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        finish();
                    }
                });

                dlg.show();
            }
        });
    }

    @SuppressLint("JavascriptInterface")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        WebView wv = findViewById(R.id.webView);
        wv.getSettings().setJavaScriptEnabled(true);
        wv.setOnLongClickListener(new View.OnLongClickListener() {
            @Override
            public boolean onLongClick(View v) {
                return true;
            }
        });
        wv.setLongClickable(false);
        String url = "file:///android_asset/index.html";
        wv.loadUrl(url);
        wv.addJavascriptInterface(new WebAppInterface(), "Android");
        tts = new TextToSpeech(getApplicationContext(), new TextToSpeech.OnInitListener() {
            @Override
            public void onInit(int status) {
                if(TextToSpeech.ERROR != status) {
                    tts.setLanguage(Locale.ENGLISH);
                    tts.setSpeechRate(0.7f);
                } else {
                    tts = null;
                }
            }
        });
    }
}