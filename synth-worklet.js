class SF2Processor extends AudioWorkletProcessor {

  constructor(){
    super();

    this.voices = new Map();

    this.port.onmessage = e => {

      const msg = e.data;

      if(msg.type === "noteOn"){

        this.voices.set(msg.key,{
          buffer: msg.buffer,
          pos: 0,
          rate: msg.rate,
          gain: msg.gain,
          loopStart: msg.loopStart,
          loopEnd: msg.loopEnd,
          release: false
        });

      }

      if(msg.type === "noteOff"){
        const v = this.voices.get(msg.key);
        if(v){
          v.release = true; // 削除せずリリース開始
        }
      }

    };
  }

  process(inputs, outputs){

    const outL = outputs[0][0];
    const outR = outputs[0][1];

    for(let i=0;i<outL.length;i++){

      let sample = 0;

      for(const [key, voice] of this.voices){

        const idx = voice.pos | 0;

        if(idx < voice.buffer.length){

          sample += voice.buffer[idx] * voice.gain;

          voice.pos += voice.rate;

          if(voice.loopEnd > voice.loopStart && voice.pos > voice.loopEnd){
            voice.pos = voice.loopStart;
          }

          // release処理
          if(voice.release){
            voice.gain -= 0.05;

            if(voice.gain < 0.0001){
              this.voices.delete(key);
            }
          }

        } else {
          this.voices.delete(key);
        }

      }

      outL[i] = sample;
      outR[i] = sample;

    }

    return true;
  }

}

registerProcessor("sf2-player", SF2Processor);
