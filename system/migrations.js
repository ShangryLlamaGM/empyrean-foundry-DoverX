export const runMigrations = () => {
  if (!game.user.isGM) return

  const currentVersion = game.settings.get('empyrean', 'systemMigrationVersion')
  const NEEDS_MIGRATION_VERSION = '0.0.8'

  const needsMigration =
    !currentVersion ||
    foundry.utils.isNewerVersion(NEEDS_MIGRATION_VERSION, currentVersion)

  if (needsMigration) {
    migrate()
    game.settings.set(
      'empyrean',
      'systemMigrationVersion',
      NEEDS_MIGRATION_VERSION,
    )
  }
}

const migrate = () => {
  const tracks = game.settings.get('empyrean', 'activeTracks')
  for (const track of Object.values(tracks)) {
    track.visibility = track.firefly ? 'secret' : (track.isScene ? 'scene' : 'open');
    tracks[track.id] = track
  }

  game.settings.set('empyrean', 'activeTracks', tracks)
}
