'use strict';

describe('ProAct.Array and ProAct.Stream integration.', function () {

  describe('ProAct.Array.Core#makeListener', function () {

    it ('triggering simple values in ProAct.Stream source of a ProAct.Array, adds them to it', function () {
      var array = new ProAct.Array(),
          stream = new ProAct.Stream();

      array.core.into(stream);

      stream.trigger('one');

      expect(array.length).toBe(1);
      expect(array[0]).toEqual('one');
    });

    it ('triggering simple remove event in ProAct.Stream source of a ProAct.Array, removes element', function () {
      var array = new ProAct.Array(5, 4, 6),
          stream = new ProAct.Stream();

      array.core.into(stream);

      stream.trigger(ProAct.Event.simple('array', 'pop'));

      expect(array.length).toBe(2);
      expect(array[0]).toEqual(5);
      expect(array[1]).toEqual(4);

      stream.trigger(ProAct.Event.simple('array', 'shift'));
      expect(array.length).toBe(1);
      expect(array[0]).toEqual(4);
    });
  });

});
