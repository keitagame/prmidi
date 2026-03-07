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
          loopEnd: msg.loopEnd
        });

      }

      if(msg.type === "noteOff"){
        this.voices.delete(msg.key);
      }

    };
  }

  process(inputs, outputs){

    const outL = outputs[0][0];
    const outR = outputs[0][1];

    for(let i=0;i<outL.length;i++){

      let sample = 0;

      for(const voice of this.voices.values()){

        const idx = voice.pos|0;

        if(idx < voice.buffer.length){

          sample += voice.buffer[idx] * voice.gain;

          voice.pos += voice.rate;

          if(voice.loopEnd>voice.loopStart && voice.pos>voice.loopEnd){
            voice.pos = voice.loopStart;
          }

        }

      }

      outL[i] = sample;
      outR[i] = sample;

    }

    return true;
  }

}

registerProcessor("sf2-player", SF2Processor);
