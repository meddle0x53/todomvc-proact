(function( window, $, ProAct ) {
  'use strict';

  function makePipe (context, source, destination, meta, args) {
    if (!meta) {
      meta = '';
    }
    if (!args) {
      args = [];
    }

    var ln = args.length;
    var currentArg = args.length + 1;
    var destinationDsl;
    var pipe;

    if (P.U.isString(source)) {
      source = actorFromPath(context, source, null);
      // TODO Throw an error if source is not ProAct.Actor
    }

    meta = updateMeta(meta, '<<($' + currentArg + ')');
    args.push(source);

    if (P.U.isString(destination)) {
      destination = actorFromPath(context, destination, null);

      destinationDsl = P.U.isFunction(destination) ? '@' : '>>',
    }

    currentArg += 1;
    meta = updateMeta(meta, destinationDsl + '($' + currentArg + ')');
    args.push(destination);

    pipe = setupStream(context, null, meta, args);
    if (P.U.isArray(destination)) {
      context.multyStreams[destinationName] = stream;
    }

    return pipe;
  }

  function setupStream (context, streamKey, streamData, args) {
    var key = streamKey ? streamKey : ProAct.Utils.uuid(),
        streamArgs = ['s:' + key, streamData];

    if (args.length) {
      streamArgs = streamArgs.concat(args);
    }

    return context.registry.make.apply(context.registry, streamArgs);
  }

  function updateMeta(meta, metaFragment) {
    if (meta === '') {
      return metaFragment;
    }

    return meta + '|' + metaFragment;
  }

  function arrayFilter (context, array, filter, path) {
    return new ProAct.ArrayFilter(array, filter, context.registry, path);
  }

  function allArrayActors (array, paths) {
    var i, ln = array.length,
        props = [],
        path = paths.join('.');

    for (i = 0; i < ln; i++) {
      props.push(propFromPath(path, array[i]))
    }

    return props;
  }

  function actorFromPath (context, path, obj) {
    var actor = obj ? obj : context; // The actor to read the actor path from.
    var i, paths = path.split('.'), ln = paths.length - 1; // Path is split to be iterated.
    var path, prev, method; // Helper vars.

    for (i = 0; i < ln; i++) {
      path = paths[i];

      // If the current path is '[]' -> it means the properties from the whole array.
      // So someArray[].stuff -> will retrieve an array of the all stuff actors.
      if (path === '[]') {
        return allArrayActors(actor._array, paths.slice(i + 1));
      // If the current path is '[filter]' -> the actor is a new ArrayFilter with the filter.
      } else if (path.charAt(0) === '[' && path.charAt(path.length - 1) === ']') {
        return arrayFilter(context, actor, path.substring(1, path.length - 1), paths.slice(i + 1).join('.'));
      }

      actor = actor[path];
    }

    // Last part of the path found - so and the last actor.
    path = paths[i];
    prev = actor;
    actor = actor.p(path);

    // It is possible to have action instead of actor.
    // So the function is returned but bound to its context (which is actor).
    if (!actor && path.indexOf('do') === 0) {
      path = path.toLowerCase().substring(2);
      method = prev[path];
      if (method && P.U.isFunction(method)) {
        return P.U.bind(prev, method);
      }
    }

    // Same as the above but the action is part of the context's registered lambdas.
    if (!actor && path.indexOf('l:') === 0) {
      method = context.regRead(path);
      if (method) {
        prev = prev[method] ? prev : context;

        return P.U.bind(prev, context.regRead(path));
      }
    }

    // If the actor is an ArrayProperty -> we work with the array.
    if (actor.type && (actor.type() === ProAct.Property.Types.array)) {
      actor = actor.get().core;
    }

    // If the actor is an AutoProperty containing array -> we work with the array.
    if (actor.type && (actor.type() === ProAct.Property.Types.auto)) {
      if (P.U.isProArray(actor.get())) {
        actor = actor.get().core;
      }
    }

    // For ProxyProperties -> we work with the original
    while (actor.target) {
      actor = actor.target;
    }

    return actor;
  }

})( window, $, ProAct);
