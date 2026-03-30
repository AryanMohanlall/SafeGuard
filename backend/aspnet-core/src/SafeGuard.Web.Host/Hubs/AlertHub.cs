using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SafeGuard.Web.Host.Hubs
{
    public class AlertHub : Hub
    {
        private static readonly ConcurrentDictionary<string, HashSet<string>> UserConnections =
            new ConcurrentDictionary<string, HashSet<string>>();
        private static readonly object SyncRoot = new object();

        public override Task OnConnectedAsync()
        {
            if (!string.IsNullOrWhiteSpace(Context.UserIdentifier))
            {
                lock (SyncRoot)
                {
                    if (!UserConnections.TryGetValue(Context.UserIdentifier, out var connections))
                    {
                        connections = new HashSet<string>();
                        UserConnections[Context.UserIdentifier] = connections;
                    }

                    connections.Add(Context.ConnectionId);
                }
            }

            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(System.Exception exception)
        {
            if (!string.IsNullOrWhiteSpace(Context.UserIdentifier))
            {
                lock (SyncRoot)
                {
                    if (UserConnections.TryGetValue(Context.UserIdentifier, out var connections))
                    {
                        connections.Remove(Context.ConnectionId);
                        if (connections.Count == 0)
                        {
                            UserConnections.TryRemove(Context.UserIdentifier, out _);
                        }
                    }
                }
            }

            return base.OnDisconnectedAsync(exception);
        }

        public static IReadOnlyList<string> GetConnectionsForUser(string userId)
        {
            lock (SyncRoot)
            {
                return UserConnections.TryGetValue(userId, out var connections)
                    ? connections.ToList()
                    : new List<string>();
            }
        }
    }
}
