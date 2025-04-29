import { useState, useMemo } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import ImageViewer from './ImageViewer';
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { MosqType } from '@/models/mosq';
import { convertToAmPm, formatToDate, formatTimeToHHMM } from '@/utils/format';
import Link from 'next/link';

const MosqueCard = ({ mosq }: { mosq: MosqType }) => {
  console.log(mosq);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const nextPrayer = useMemo(() => {
    const now = new Date();

    const prayerTimesArray = [
      mosq.prayerTimes?.fajr && { name: 'Fajr', time: formatToDate(mosq.prayerTimes?.fajr?.hours, mosq.prayerTimes?.fajr?.minutes) },
      mosq.prayerTimes?.zohar && { name: 'Zohar', time: formatToDate(mosq.prayerTimes?.zohar.hours, mosq.prayerTimes?.zohar.minutes) },
      mosq.prayerTimes?.asr && { name: 'Asr', time: formatToDate(mosq.prayerTimes?.asr.hours, mosq.prayerTimes?.asr.minutes) },
      mosq.prayerTimes?.maghrib && { name: 'Maghrib', time: formatToDate(mosq.prayerTimes?.maghrib.hours, mosq.prayerTimes?.maghrib.minutes) },
      mosq.prayerTimes?.isha && { name: 'Isha', time: formatToDate(mosq.prayerTimes?.isha.hours, mosq.prayerTimes?.isha.minutes) },
      mosq.prayerTimes?.juma && { name: 'Juma', time: formatToDate(mosq.prayerTimes?.juma.hours, mosq.prayerTimes?.juma.minutes) },
      mosq.prayerTimes?.eidulfitr && { name: 'Eid-ul-Fitr', time: formatToDate(mosq.prayerTimes?.eidulfitr.hours, mosq.prayerTimes?.eidulfitr.minutes) },
      mosq.prayerTimes?.eidulazha && { name: 'Eid-ul-Azha', time: formatToDate(mosq.prayerTimes?.eidulazha.hours, mosq.prayerTimes?.eidulazha.minutes) }
    ].filter(Boolean);

    const currentfHour = now.getHours();
    const currentfMinute = now.getMinutes();

    // Check if it's          Juma day     --------------------------------  if the mosq has juma prayer time  -----------------------------  -------- if it is before juma time-----------   ------------------------------------ if it is after fajr time -------------------------------    ----------------------------------- if it is around juma time -----------------------------------
    const itsJumaTime = now.getDay() === 5 && mosq.prayerTimes?.juma?.hours !== undefined && mosq.prayerTimes?.juma?.minutes !== undefined && ((currentfHour < mosq.prayerTimes.juma.hours && currentfHour > mosq.prayerTimes.fajr.hours && currentfMinute > mosq.prayerTimes.fajr.minutes) || (currentfHour === mosq.prayerTimes.juma.hours && currentfMinute < mosq.prayerTimes.juma.minutes));

    const upcoming = itsJumaTime ? prayerTimesArray.find(prayer => prayer?.name === 'juma') : prayerTimesArray.find(prayer => prayer?.time !== undefined && prayer.time > now);

    const next = upcoming ?? prayerTimesArray[0]; // if all today's prayers passed, pick first of next day

    // Using the utility function instead of inline formatting
    const formattedTime = formatTimeToHHMM(next?.time);

    return { name: next?.name, time: formattedTime };
  }, [mosq.prayerTimes]);

  return (
    <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="relative w-12 h-12 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
          {mosq.photos[0] ? (
            <img
              src={mosq.photos[0]}
              alt={mosq.name}
              className="w-full h-full object-cover"
              onClick={() => { setIsImageOpen(true); setSelectedImage(mosq.photos[0]) }}
            />
          ) : (
            <div className="text-4xl text-muted-foreground">🕌</div>
          )}
        </div>

        <div className="flex-1">
          <Link href={`/mosques/${mosq.id}`}>
            <h3
              className="text-xl font-bold hover:text-primary cursor-pointer"
            >
              {mosq.name}
            </h3>
          </Link>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <MapPin size={14} className="flex-shrink-0" />
            <span>{mosq.location}</span>
          </div>

          <Link
            target='_blank'
            href={`https://www.google.com/maps/dir/?api=1&destination=${'type' in mosq.coordinates ? mosq.coordinates.coordinates[1] : mosq.coordinates[1]},${'type' in mosq.coordinates ? mosq.coordinates.coordinates[0] : mosq.coordinates[0]}`}
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 mt-1"
          >
            <Navigation size={14} />
            <span>View on google map</span>
          </Link>
        </div>
      </div>

      <Accordion type="single" collapsible value={isExpanded ? "times" : ""} className='w-full'>
        <AccordionItem value="times" className="border-0">
          <AccordionTrigger
            onClick={() => setIsExpanded(!isExpanded)}
            className="py-2 px-4 rounded-md bg-background/50 hover:bg-background/80 transition-colors"
          >
            <span className="text-sm font-medium">{nextPrayer.name} @ {convertToAmPm(nextPrayer.time)}</span>
          </AccordionTrigger>
          <AccordionContent className="pt-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prayer</TableHead>
                  <TableHead>Azan</TableHead>
                  <TableHead>Iqamah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Fajr</TableCell>
                  <TableCell>{mosq.azanTimes?.fajr ? convertToAmPm(`${mosq.azanTimes.fajr.hours}:${mosq.azanTimes.fajr.minutes}`) : '-'}</TableCell>
                  <TableCell>{convertToAmPm(`${mosq.prayerTimes?.fajr?.hours}:${mosq.prayerTimes?.fajr?.minutes}`)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Zohar</TableCell>
                  <TableCell>{mosq.azanTimes?.zohar ? convertToAmPm(`${mosq.azanTimes.zohar.hours}:${mosq.azanTimes.zohar.minutes}`) : '-'}</TableCell>
                  <TableCell>{convertToAmPm(`${mosq.prayerTimes?.zohar?.hours}:${mosq.prayerTimes?.zohar?.minutes}`)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Asr</TableCell>
                  <TableCell>{mosq.azanTimes?.asr ? convertToAmPm(`${mosq.azanTimes.asr.hours}:${mosq.azanTimes.asr.minutes}`) : '-'}</TableCell>
                  <TableCell>{convertToAmPm(`${mosq.prayerTimes?.asr?.hours}:${mosq.prayerTimes?.asr?.minutes}`)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Maghrib</TableCell>
                  <TableCell>{mosq.azanTimes?.maghrib ? convertToAmPm(`${mosq.azanTimes.maghrib.hours}:${mosq.azanTimes.maghrib.minutes}`) : '-'}</TableCell>
                  <TableCell>{convertToAmPm(`${mosq.prayerTimes?.maghrib?.hours}:${mosq.prayerTimes?.maghrib?.minutes}`)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Isha</TableCell>
                  <TableCell>{mosq.azanTimes?.isha ? convertToAmPm(`${mosq.azanTimes.isha.hours}:${mosq.azanTimes.isha.minutes}`) : '-'}</TableCell>
                  <TableCell>{convertToAmPm(`${mosq.prayerTimes?.isha?.hours}:${mosq.prayerTimes?.isha?.minutes}`)}</TableCell>
                </TableRow>
                {mosq.prayerTimes?.juma && (
                  <TableRow>
                    <TableCell>Juma</TableCell>
                    <TableCell>{mosq.azanTimes?.juma ? convertToAmPm(`${mosq.azanTimes.juma.hours}:${mosq.azanTimes.juma.minutes}`) : '-'}</TableCell>
                    <TableCell>{convertToAmPm(`${mosq.prayerTimes?.juma?.hours}:${mosq.prayerTimes?.juma?.minutes}`)}</TableCell>
                  </TableRow>
                )}
                {mosq.prayerTimes?.eidulfitr && (
                  <TableRow>
                    <TableCell>Eid-ul-Fitr</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>{convertToAmPm(`${mosq.prayerTimes?.eidulfitr?.hours}:${mosq.prayerTimes?.eidulfitr?.minutes}`)}</TableCell>
                  </TableRow>
                )}
                {mosq.prayerTimes?.eidulazha && (
                  <TableRow>
                    <TableCell>Eid-ul-Azha</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>{convertToAmPm(`${mosq.prayerTimes?.eidulazha?.hours}:${mosq.prayerTimes?.eidulazha?.minutes}`)}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <ImageViewer
        src={selectedImage}
        isOpen={isImageOpen}
        onClose={() => setIsImageOpen(false)}
      />
    </Card>
  );
};

export default MosqueCard;