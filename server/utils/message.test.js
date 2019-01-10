const expect = require('expect');

var {generateMessage, generateLocationMessage} = require('./message');

describe('generateMessage', () =>{
  it('should generate correct message object', ()=>{
    var result = generateMessage('User1', 'Message1');

    expect(result.from).toBe('User1')
    expect(result.text).toBe('Message1')
    expect(typeof result.createdAt).toBe('number');
  })

})

describe('generateLocationMessage', ()=>{
  it('should generate correct location object', () =>{
      var result = generateLocationMessage('Admin', 1, 1);

      expect(result.from).toBe('Admin');
      expect(result.url).toBe('https://www.google.com/maps?q=1,1');
  });
});
