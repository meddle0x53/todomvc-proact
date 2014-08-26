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

    it ('triggering simple splice event in ProAct.Stream source of a ProAct.Array, removes the element on the passed index', function () {
      var array = new ProAct.Array(5, 4, 6, 7, 8),
          stream = new ProAct.Stream();

      array.core.into(stream);

      stream.trigger(ProAct.Event.simple('array', 'splice', 2));

      expect(array.length).toBe(4);
      expect(array[0]).toEqual(5);
      expect(array[1]).toEqual(4);
      expect(array[2]).toEqual(7);
      expect(array[3]).toEqual(8);
    });

    it ('triggering simple deleteElement event in ProAct.Stream source of a ProAct.Array, removes the element', function () {
      var array = new ProAct.Array(5, 4, 6, 7, 8),
          stream = new ProAct.Stream();

      array.core.into(stream);

      stream.trigger(ProAct.Event.simple('array', 'deleteElement', 6, array));

      expect(array.length).toBe(4);
      expect(array[0]).toEqual(5);
      expect(array[1]).toEqual(4);
      expect(array[2]).toEqual(7);
      expect(array[3]).toEqual(8);
    });

    it ('triggering simple deleteElement without array context event in ProAct.Stream source of a ProAct.Array, removes the element', function () {
      var array = new ProAct.Array(5, 4, 6, 7, 8),
          stream = new ProAct.Stream();

      array.core.into(stream);

      stream.trigger(ProAct.Event.simple('array', 'deleteElement', 6));

      expect(array.length).toBe(4);
      expect(array[0]).toEqual(5);
      expect(array[1]).toEqual(4);
      expect(array[2]).toEqual(7);
      expect(array[3]).toEqual(8);
    });
  });

});
