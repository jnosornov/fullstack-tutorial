module.exports = {
  Query: {
    launches: (_, __, ctx) => {
      const { dataSources } = ctx
      return dataSources.launchAPI.getAllLaunches()
    },
    launch: (_, { id }, { dataSources }) =>
      dataSources.launchAPI.getLaunchById({ launchId: id }),
    me: (_, __, { dataSources }) => dataSources.userAPI.findOrCreateUser(),
  },
  Mission: {
    missionPatch: (mission, { size } = { size: 'LARGE' }) => {
      return size === 'SMALL'
        ? mission.missionPatchSmall
        : mission.missionPatchLarge
    },
  },
  Launch: {
    isBooked: async (launch, _, ctx) => {
      const { dataSources } = ctx
      return dataSources.userAPI.isBookedOnLaunch({ launchId: launch.id })
    },
  },
  User: {
    trips: async (_, __, ctx) => {
      // get ids of launches by user
      const { dataSources } = ctx
      const launchIds = await dataSources.userAPI.getLaunchIdsByUser()
      if (!launchIds.length) return []

      // look up lunches by ids
      return dataSources.launchAPI.getLaunchesByIds({ launchIds }) || []
    },
  },
}
