const { paginateResults } = require('./utils')

module.exports = {
  Query: {
    launches: async (_, { pageSize = 20, after }, ctx) => {
      const { dataSources } = ctx
      const allLaunches = await dataSources.launchAPI.getAllLaunches()

      // we want these in reverse chronological order
      allLaunches.reverse()
      const launches = paginateResults({
        after,
        pageSize,
        results: allLaunches,
      })

      return {
        launches,
        cursor: launches.length ? launches[launches.length - 1].cursor : null,
        hasMore: launches.length
          ? launches[launches.length - 1].cursor !==
            allLaunches[allLaunches.length - 1].cursor
          : false,
      }
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
