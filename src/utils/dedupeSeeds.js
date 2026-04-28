const buildKey = seed =>
  `${seed.value}::${seed.niche}`;

const dedupeSeeds = seeds => {
  const map = new Map();

  seeds.forEach(seed => {
    const key = buildKey(seed);

    if (!map.has(key)) {
      map.set(key, seed);
    }
  });

  const uniqueSeeds = Array.from(map.values());

  return {
    uniqueSeeds,
    duplicatesRemoved: seeds.length - uniqueSeeds.length,
  };
};

module.exports = {
  dedupeSeeds,
};