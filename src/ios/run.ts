import { spawnSync } from 'child_process'; // TODO: need cross-spawn for windows?

export type UDID = string;
export interface IOSDevice {
  readonly deviceClass: string;
  readonly deviceName: string;
  readonly productType: string; // TODO: map to actual model (ie. iPhone8,4 -> iPhone SE)
  readonly productVersion: string;
}

export async function getConnectedDevicesUDIDs(): Promise<UDID[]> {
  const iDeviceId = spawnSync('idevice_id', ['--list'], { encoding: 'utf8' });
  // split results on \n
  return iDeviceId.stdout.match(/.+/g) || [];
}

export async function getConnectedDevicesInfo(udids: UDID[]): Promise<IOSDevice[]> {
  return Promise.all(
    udids.map(udid => getConnectedDeviceInfo(udid))
  );
}

export async function getConnectedDeviceInfo(udid: UDID): Promise<IOSDevice> {
  const iDeviceInfo = spawnSync('ideviceinfo', ['--simple', '--udid', udid], { encoding: 'utf8' });
  return parseDeviceInfo(iDeviceInfo.stdout);
}

function parseDeviceInfo(deviceInfo: string): IOSDevice {
  return {
    deviceClass: matchDeviceProperty(deviceInfo, 'DeviceClass'),
    deviceName: matchDeviceProperty(deviceInfo, 'DeviceName'),
    productType: matchDeviceProperty(deviceInfo, 'ProductType'),
    productVersion: matchDeviceProperty(deviceInfo, 'ProductVersion'),
  };
}

function matchDeviceProperty(deviceInfo: string, prop: string) {
  const result = deviceInfo.match(new RegExp(`${prop}:\\s+(.+)`));
  if (!result || result.length !== 2) {
    return '';
  }
  return result[1];
}

export async function run(args: string[]) {
  const udids = await getConnectedDevicesUDIDs();
  const info: any = await getConnectedDevicesInfo(udids);
  console.log(info);
}