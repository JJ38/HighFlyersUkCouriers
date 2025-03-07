import { resolve } from 'path'
import { defineConfig } from 'vite'

const root = resolve(__dirname, 'public');

export default defineConfig({
    root,
    base: '',
    build: {
      // manifest: true,
      emptyOutDir: true,
      outDir: '../dist/templates',
      assetsDir: 'assets',
      rollupOptions: {
        input: {
          main: resolve(root, 'index.html'),
          AboutUs: resolve(root, 'about-us.html'),
          AddOrder: resolve(root, 'add-order.html'),
          AddUser: resolve(root, 'add-user.html'),
          Prices: resolve(root, 'prices.html'),
          Bookings: resolve(root, 'bookings.html'),
          ChangePassword: resolve(root, 'change-password.html'),
          ContactUs: resolve(root, 'contact-us.html'),
          ContentManager: resolve(root, 'content-manager.html'),
          CustomerOrder: resolve(root, 'customer-order.html'),
          CustomerProfile: resolve(root, 'customer-profile.html'),
          DeleteMultipleOrders: resolve(root, 'delete-multiple-orders.html'),
          DeleteOrder: resolve(root, 'delete-order.html'),
          DeleteUser: resolve(root, 'delete-user.html'),
          EditOrders: resolve(root, 'edit-order.html'),
          FAQ: resolve(root, 'f-a-q.html'),
          LiveLogisticsManager: resolve(root, 'live-logistics-manager.html'),
          LoginPage: resolve(root, 'loginpage.html'),
          ManageAccounts: resolve(root, 'manage-accounts.html'),
          ManageOrders: resolve(root, 'manage-orders.html'),
          ShipmentsLogisticsManager: resolve(root, 'shipments-logistics-manager.html'),
          ViewOrder: resolve(root, 'view-order.html'),

        },
        output: {
          // assetFileNames: "assets/[name][extname]",
          // chunkFileNames: "assets/[name].js",
          // entryFileNames: "assets/[name].js",
        }
      }
    },
    plugins: [
      {
        name: 'reload',
        configureServer(server) {
          const {ws, watcher} = server;
          watcher.on('change', file => {
            if (file.endsWith('.html')) {
              ws.send({
                type: 'full-reload',
              });
            }
            if (file.endsWith('.js')) {
              ws.send({
                type: 'full-reload',
              });
            }
          });
        },
      },
    ],
    server: {
    
      watch: {
        usePolling: true,
      }
    },
    
  })