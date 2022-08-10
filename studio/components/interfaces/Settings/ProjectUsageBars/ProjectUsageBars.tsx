import { FC, useEffect } from 'react'
import { Badge, Loading } from '@supabase/ui'

import { useStore, useProjectUsage } from 'hooks'
import { formatBytes } from 'lib/helpers'
import { USAGE_APPROACHING_THRESHOLD } from 'lib/constants'
import SparkBar from 'components/ui/SparkBar'
import ShimmeringLoader from 'components/ui/ShimmeringLoader'
import { usageBasedItems } from './ProjectUsageBars.constants'

interface Props {
  projectRef?: string
}

const ProjectUsage: FC<Props> = ({ projectRef }) => {
  const { ui } = useStore()
  const { usage, error, isLoading } = useProjectUsage(projectRef)
  console.log(usage)

  useEffect(() => {
    if (error) {
      ui.setNotification({
        category: 'error',
        message: `Failed to get project's usage data: ${error?.message ?? 'unknown'}`,
      })
    }
  }, [error])

  // [Joshen TODO] After API is ready need to update to include dbEgress, storageEgress
  // And also to highlight in this chart which components are "approaching" and "over"
  const mockUsage: any = {
    dbSize: { usage: 20773283, limit: 524288000 },
    dbEgress: { usage: 400000000, limit: 524288000 },
    storageSize: { usage: 624288000, limit: 524288000 },
    storageEgress: { usage: 2048, limit: 524288000 },
  }

  return (
    <Loading active={isLoading}>
      <div>
        {usageBasedItems.map((product) => {
          const isExceededUsage = product.features
            .map((feature) => {
              const featureUsage = mockUsage[feature.key]
              return featureUsage.usage / featureUsage.limit > 1
            })
            .some((x) => x === true)
          return (
            <div
              key={product.title}
              className={[
                'mb-8 overflow-hidden rounded border',
                'border-panel-border-light dark:border-panel-border-dark',
              ].join(' ')}
            >
              <table className="bg-panel-body-light dark:bg-panel-body-dark w-full">
                {/* Header */}
                <thead className="bg-panel-header-light dark:bg-panel-header-dark">
                  <tr className="overflow-hidden rounded">
                    <th className="w-1/4 px-6 py-3 text-left">
                      <div className="flex items-center space-x-4">
                        <div
                          className={[
                            'flex h-8 w-8 items-center justify-center',
                            'rounded bg-scale-500 dark:bg-white',
                          ].join(' ')}
                        >
                          {product.icon}
                        </div>
                        <h5 className="mb-0">{product.title}</h5>
                      </div>
                    </th>
                    {/* Plan Limits */}
                    <th className="hidden p-3 text-left text-xs font-medium leading-4 text-gray-400 lg:table-cell">
                      {isExceededUsage && <Badge color="red">Exceeded usage</Badge>}
                    </th>
                    {/* Usage */}
                    <th className="p-3 text-left text-xs font-medium leading-4 text-gray-400" />
                  </tr>
                </thead>

                {/* Line items */}
                {usage === undefined ? (
                  <div className="w-96 px-4 pt-1 pb-4">
                    <ShimmeringLoader />
                  </div>
                ) : (
                  <tbody>
                    {product.features.map((feature) => {
                      // [Joshen TODO] Update to use actual usage endpoint
                      const featureUsage = mockUsage[feature.key]
                      const usageRatio = featureUsage.usage / featureUsage.limit
                      const isApproaching = usageRatio >= USAGE_APPROACHING_THRESHOLD
                      const isExceeded = usageRatio >= 1

                      return (
                        <tr
                          key={feature.title}
                          className="border-panel-border-light dark:border-panel-border-dark border-t"
                        >
                          <td className="whitespace-nowrap px-6 py-3 text-sm text-scale-1200">
                            {feature.title}
                          </td>
                          <td className="w-1/5 whitespace-nowrap p-3 text-sm lg:table-cell hidden text-scale-1200">
                            {(usageRatio * 100).toFixed(2)} %
                          </td>
                          <td className="px-6 py-3 text-sm text-scale-1200">
                            <SparkBar
                              type="horizontal"
                              barClass={`${
                                isExceeded
                                  ? 'bg-red-900'
                                  : isApproaching
                                  ? 'bg-yellow-900'
                                  : 'bg-brand-900'
                              }`}
                              value={featureUsage.usage}
                              max={featureUsage.limit}
                              labelBottom={formatBytes(featureUsage.usage)}
                              labelTop={formatBytes(featureUsage.limit)}
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                )}
              </table>
            </div>
          )
        })}
      </div>
    </Loading>
  )
}

export default ProjectUsage
